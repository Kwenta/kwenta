import { createContainer } from 'unstated-next';
import axios from 'axios';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useCallback } from 'react';
//@ts-ignore
import getFormatedSwapData from '@jaredborders/synthswap-utils';
import { wei } from '@synthetixio/wei';
import { formatBytes32String, formatEther, parseEther } from 'ethers/lib/utils';

import Connector from 'containers/Connector';
import { CurrencyKey } from 'constants/currency';
import { walletAddressState } from 'store/wallet';
import { KWENTA_REFERRAL_ADDRESS, SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import use1InchApiUrl from 'hooks/use1InchApiUrl';
import erc20Abi from 'lib/abis/ERC20.json';
import synthSwapAbi from 'lib/abis/SynthSwap.json';
import { useTranslation } from 'react-i18next';

type Token = {
	symbol: CurrencyKey;
	name: string;
	address: string;
	decimals: string;
	logoURI: string;
};

type OneInchQuoteResponse = {
	fromToken: Token;
	toToken: Token;
	toTokenAmount: string;
	fromTokenAmount: string;
};

type OneInchSwapResponse = OneInchQuoteResponse & {
	tx: {
		from: string;
		to: string;
		data: string;
		value: string;
		gasPrice: string;
		gas: number;
	};
};

type OneInchApproveSpenderResponse = {
	address: string;
};

const useConvert = () => {
	const { signer, network, tokensMap, synthetixjs } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const oneInchApiUrl = use1InchApiUrl();
	const { t } = useTranslation();

	const get1InchSwapParams = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		slippage: number
	) => {
		const params = get1InchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount);

		const res = await axios.get<OneInchSwapResponse>(oneInchApiUrl + 'swap', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				fromAddress: walletAddress,
				slippage,
				referrerAddress: KWENTA_REFERRAL_ADDRESS,
				disableEstimate: true,
			},
		});
		return res.data;
	};

	const get1InchQuoteSwapParams = (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals?: number
	) => ({
		fromTokenAddress: quoteTokenAddress,
		toTokenAddress: baseTokenAddress,
		amount: wei(amount, decimals).toString(0, true),
	});

	const quote1Inch = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals?: number
	) => {
		const params = get1InchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals);

		const response = await axios.get<OneInchQuoteResponse>(oneInchApiUrl + 'quote', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				disableEstimate: true,
			},
		});

		return ethers.utils.formatEther(response.data.toTokenAmount).toString();
	};

	const swapSynthSwap = async (
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		slippage: number = 1
	) => {
		if (!signer) throw new Error(t('exchange.1inch.wallet-not-connected'));
		if (network.id !== 10) throw new Error(t('exchange.1inch.unsupported-network'));

		const sUsd = tokensMap['sUSD'];

		const oneInchFrom = tokensMap[fromToken.symbol] ? sUsd.address : fromToken.address;
		const oneInchTo = tokensMap[toToken.symbol] ? sUsd.address : toToken.address;

		const fromSymbolBytes = formatBytes32String(fromToken.symbol);
		const sUSDBytes = formatBytes32String('sUSD');

		let synthAmountEth = fromAmount;
		if (tokensMap[fromToken.symbol]) {
			// Get synth usd value for swapOut
			const fromAmountWei = wei(fromAmount).toString(0, true);
			const amounts = await synthetixjs?.contracts.Exchanger.getAmountsForExchange(
				fromAmountWei,
				fromSymbolBytes,
				sUSDBytes
			);

			const usdValue = amounts.amountReceived.sub(amounts.fee);
			synthAmountEth = formatEther(usdValue);
		}

		const params = await get1InchSwapParams(oneInchFrom, oneInchTo, synthAmountEth, slippage);

		const formattedData = getFormatedSwapData(params, SYNTH_SWAP_OPTIMISM_ADDRESS);

		const synthSwapContract = new ethers.Contract(
			SYNTH_SWAP_OPTIMISM_ADDRESS,
			synthSwapAbi,
			signer
		);

		if (tokensMap[toToken.symbol]) {
			const symbolBytes = formatBytes32String(toToken.symbol);
			if (formattedData.functionSelector === 'swap') {
				return await synthSwapContract.swapInto(symbolBytes, formattedData.data);
			} else {
				return await synthSwapContract.uniswapSwapInto(
					symbolBytes,
					fromToken.address,
					params.fromTokenAmount,
					formattedData.data
				);
			}
		} else {
			if (formattedData.functionSelector === 'swap') {
				return await synthSwapContract.swapOutOf(
					fromSymbolBytes,
					wei(fromAmount).toString(0, true),
					formattedData.data
				);
			} else {
				const usdValue = parseEther(synthAmountEth).toString();
				return await synthSwapContract.uniswapSwapOutOf(
					fromSymbolBytes,
					toToken.address,
					wei(fromAmount).toString(0, true),
					usdValue,
					formattedData.data
				);
			}
		}
	};

	const swap1Inch = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		slippage: number = 1
	) => {
		const params = await get1InchSwapParams(quoteTokenAddress, baseTokenAddress, amount, slippage);

		const { from, to, data, value } = params.tx;

		const tx = await signer!.sendTransaction({
			from,
			to,
			data,
			value: ethers.BigNumber.from(value),
		});

		return tx;
	};

	const get1InchApproveAddress = async () => {
		const response = await axios.get<OneInchApproveSpenderResponse>(
			oneInchApiUrl + 'approve/spender'
		);

		return response.data.address;
	};

	const createERC20Contract = useCallback(
		(tokenAddress: string) =>
			signer != null ? new ethers.Contract(tokenAddress, erc20Abi, signer) : null,
		[signer]
	);

	return {
		swap1Inch,
		swapSynthSwap,
		quote1Inch,
		get1InchApproveAddress,
		createERC20Contract,
	};
};

const OneInch = createContainer(useConvert);

export default OneInch;

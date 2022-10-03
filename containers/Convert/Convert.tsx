//@ts-ignore TODO: remove once types are added
import getFormattedSwapData from '@kwenta/synthswap';
import { wei } from '@synthetixio/wei';
import axios from 'axios';
import { ethers } from 'ethers';
import { formatBytes32String, formatEther, parseEther } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createContainer } from 'unstated-next';

import { KWENTA_REFERRAL_ADDRESS, SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import use1InchApiUrl from 'hooks/use1InchApiUrl';
import erc20Abi from 'lib/abis/ERC20.json';
import synthSwapAbi from 'lib/abis/SynthSwap.json';

type Token = {
	symbol: CurrencyKey;
	name: string;
	address: string;
	decimals: string;
	logoURI: string;
};

export type OneInchQuoteResponse = {
	fromToken: Token;
	toToken: Token;
	toTokenAmount: string;
	fromTokenAmount: string;
};

export type OneInchSwapResponse = OneInchQuoteResponse & {
	tx: {
		from: string;
		to: string;
		data: string;
		value: string;
		gasPrice: string;
		gas: number;
	};
};

export type OneInchApproveSpenderResponse = {
	address: string;
};

const protocols =
	'OPTIMISM_UNISWAP_V3,OPTIMISM_SYNTHETIX,OPTIMISM_SYNTHETIX_WRAPPER,OPTIMISM_ONE_INCH_LIMIT_ORDER,OPTIMISM_ONE_INCH_LIMIT_ORDER_V2,OPTIMISM_CURVE,OPTIMISM_BALANCER_V2,OPTIMISM_VELODROME,OPTIMISM_KYBERSWAP_ELASTIC';

const useConvert = () => {
	const {
		tokensMap,
		defaultSynthetixjs: synthetixjs,
		network,
		signer,
		walletAddress,
	} = Connector.useContainer();
	const oneInchApiUrl = use1InchApiUrl();
	const { t } = useTranslation();

	const get1InchSwapParams = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals: number,
		slippage: number
	) => {
		const params = get1InchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals);
		const res = await axios.get<OneInchSwapResponse>(oneInchApiUrl + 'swap', {
			params: {
				fromTokenAddress: params.fromTokenAddress,
				toTokenAddress: params.toTokenAddress,
				amount: params.amount,
				fromAddress: walletAddress,
				slippage,
				protocols,
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
				protocols,
			},
		});
		return ethers.utils
			.formatUnits(response.data.toTokenAmount, response.data.toToken.decimals)
			.toString();
	};

	const swapSynthSwapGasEstimate = async (
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		decimals: number,
		slippage: number = 1
	) => {
		return swapSynthSwap(fromToken, toToken, fromAmount, decimals, slippage, 'estimate_gas');
	};

	const swapSynthSwap = async (
		fromToken: Token,
		toToken: Token,
		fromAmount: string,
		decimals: number,
		slippage: number = 1,
		metaOnly?: 'meta_tx' | 'estimate_gas'
	) => {
		if (!signer) throw new Error(t('exchange.1inch.wallet-not-connected'));
		if (network?.id !== 10) throw new Error(t('exchange.1inch.unsupported-network'));

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

		const params = await get1InchSwapParams(
			oneInchFrom,
			oneInchTo,
			synthAmountEth,
			decimals,
			slippage
		);

		const formattedData = getFormattedSwapData(params, SYNTH_SWAP_OPTIMISM_ADDRESS);

		const synthSwapContract = new ethers.Contract(
			SYNTH_SWAP_OPTIMISM_ADDRESS,
			synthSwapAbi,
			signer
		);

		const contractFunc =
			metaOnly === 'meta_tx'
				? synthSwapContract.populateTransaction
				: metaOnly === 'estimate_gas'
				? synthSwapContract.estimateGas
				: synthSwapContract;

		if (tokensMap[toToken.symbol]) {
			const symbolBytes = formatBytes32String(toToken.symbol);
			if (formattedData.functionSelector === 'swap') {
				return contractFunc.swapInto(symbolBytes, formattedData.data);
			} else {
				return contractFunc.uniswapSwapInto(
					symbolBytes,
					fromToken.address,
					params.fromTokenAmount,
					formattedData.data
				);
			}
		} else {
			if (formattedData.functionSelector === 'swap') {
				return contractFunc.swapOutOf(
					fromSymbolBytes,
					wei(fromAmount).toString(0, true),
					formattedData.data
				);
			} else {
				const usdValue = parseEther(synthAmountEth).toString();
				return contractFunc.uniswapSwapOutOf(
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
		decimals: number,
		slippage: number = 1,
		metaOnly = false
	) => {
		const params = await get1InchSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			decimals,
			slippage
		);

		const { from, to, data, value } = params.tx;

		const tx = metaOnly
			? await signer!.populateTransaction({
					from,
					to,
					data,
					value: ethers.BigNumber.from(value),
			  })
			: await signer!.sendTransaction({
					from,
					to,
					data,
					value: ethers.BigNumber.from(value),
			  });
		return tx;
	};

	const swap1InchGasEstimate = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals: number,
		slippage: number = 1
	) => {
		const params = await get1InchSwapParams(
			quoteTokenAddress,
			baseTokenAddress,
			amount,
			decimals,
			slippage
		);

		const { gas } = params.tx;

		return gas;
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
		swapSynthSwapGasEstimate,
		swap1InchGasEstimate,
	};
};

const OneInch = createContainer(useConvert);

export default OneInch;

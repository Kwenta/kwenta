import { createContainer } from 'unstated-next';
import axios from 'axios';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useCallback } from 'react';

import erc20Abi from 'lib/abis/ERC20.json';

import Connector from 'containers/Connector';

import { CurrencyKey } from 'constants/currency';

import { walletAddressState } from 'store/wallet';
import { wei } from '@synthetixio/wei';

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
	const { signer } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);

	const get1InchQuoteSwapParams = (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals?: number
	) => ({
		fromTokenAddress: quoteTokenAddress,
		toTokenAddress: baseTokenAddress,
		amount: wei(amount).toString(0, true),
	});

	const quote1Inch = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		decimals?: number
	) => {
		const params = get1InchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals);

		const response = await axios.get<OneInchQuoteResponse>(
			'https://api.1inch.exchange/v3.0/1/quote',
			{
				params: {
					fromTokenAddress: params.fromTokenAddress,
					toTokenAddress: params.toTokenAddress,
					amount: params.amount,
				},
			}
		);

		return ethers.utils.formatEther(response.data.toTokenAmount).toString();
	};

	const swap1Inch = async (
		quoteTokenAddress: string,
		baseTokenAddress: string,
		amount: string,
		slippage: number = 1,
		decimals?: number
	) => {
		const params = get1InchQuoteSwapParams(quoteTokenAddress, baseTokenAddress, amount, decimals);

		const response = await axios.get<OneInchSwapResponse>(
			'https://api.1inch.exchange/v3.0/1/swap',
			{
				params: {
					fromTokenAddress: params.fromTokenAddress,
					toTokenAddress: params.toTokenAddress,
					amount: params.amount,
					fromAddress: walletAddress,
					slippage,
				},
			}
		);

		const { from, to, data, value } = response.data.tx;

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
			'https://api.1inch.exchange/v3.0/1/approve/spender'
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
		quote1Inch,
		get1InchApproveAddress,
		createERC20Contract,
	};
};

const OneInch = createContainer(useConvert);

export default OneInch;

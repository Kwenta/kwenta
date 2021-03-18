import { createContainer } from 'unstated-next';
import axios from 'axios';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';

import { toBigNumber } from 'utils/formatters/number';

import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';
import { CurrencyKey } from 'constants/currency';

import { walletAddressState } from 'store/wallet';

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

const useOneInch = () => {
	const { getTokenAddress, signer } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);

	const getQuoteSwapParams = (
		quoteCurrencyKey: CurrencyKey,
		baseCurrencyKey: CurrencyKey,
		amount: string
	) => ({
		fromTokenAddress: getTokenAddress(quoteCurrencyKey),
		toTokenAddress: getTokenAddress(baseCurrencyKey),
		amount: toBigNumber(amount)
			.multipliedBy(toBigNumber(10).exponentiatedBy(DEFAULT_TOKEN_DECIMALS))
			.toString(),
	});

	const quote = async (
		quoteCurrencyKey: CurrencyKey,
		baseCurrencyKey: CurrencyKey,
		amount: string
	) => {
		try {
			const params = getQuoteSwapParams(quoteCurrencyKey, baseCurrencyKey, amount);

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

			return toBigNumber(response.data.toTokenAmount).dividedBy(1e18).toString();
		} catch (e) {
			console.log(e);
			return null;
		}
	};

	const swap = async (
		quoteCurrencyKey: CurrencyKey,
		baseCurrencyKey: CurrencyKey,
		amount: string,
		slippage: number = 1
	) => {
		try {
			const params = getQuoteSwapParams(quoteCurrencyKey, baseCurrencyKey, amount);

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
		} catch (e) {
			console.log(e);
			return null;
		}
	};

	return {
		swap,
		quote,
	};
};

const OneInch = createContainer(useOneInch);

export default OneInch;

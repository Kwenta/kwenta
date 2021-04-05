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
		amount: toBigNumber(amount)
			.multipliedBy(toBigNumber(10).exponentiatedBy(decimals ?? DEFAULT_TOKEN_DECIMALS))
			.toString(),
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

		return toBigNumber(response.data.toTokenAmount).dividedBy(1e18).toString();
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

	return {
		swap1Inch,
		quote1Inch,
		get1InchApproveAddress,
	};
};

const OneInch = createContainer(useConvert);

export default OneInch;

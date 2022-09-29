import { NetworkId } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import logError from 'utils/logError';

import { getContractsByNetwork } from './contracts';

export default class ExchangeService {
	private networkId: NetworkId;

	constructor(networkId: NetworkId) {
		this.networkId = networkId;
	}

	public get contracts() {
		return getContractsByNetwork(this.networkId);
	}

	public async getBaseFeeRate(sourceCurrencyKey: string, destinationCurrencyKey: string) {
		const [sourceCurrencyFeeRate, destinationCurrencyFeeRate] = await Promise.all([
			this.contracts.SystemSettings?.exchangeFeeRate(
				ethers.utils.formatBytes32String(sourceCurrencyKey as string)
			),
			this.contracts.SystemSettings?.exchangeFeeRate(
				ethers.utils.formatBytes32String(destinationCurrencyKey as string)
			),
		]);

		return sourceCurrencyFeeRate && destinationCurrencyFeeRate
			? sourceCurrencyFeeRate.add(destinationCurrencyFeeRate)
			: null;
	}

	public async getExchangeFeeRate(sourceCurrencyKey: string, destinationCurrencyKey: string) {
		return await this.contracts.Exchanger?.feeRateForExchange(
			ethers.utils.formatBytes32String(sourceCurrencyKey as string),
			ethers.utils.formatBytes32String(destinationCurrencyKey as string)
		);
	}

	public handleApprove(currencyKey: string) {
		logError(currencyKey);
	}

	public handleSettle() {}

	public handleExchange() {}
}

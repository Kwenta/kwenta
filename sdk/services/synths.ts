import { CurrencyKey } from '@synthetixio/contracts-interface';
import { SynthBalancesMap } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { orderBy } from 'lodash';
import KwentaSDK from 'sdk';

import { notNill } from 'queries/synths/utils';
import { zeroBN } from 'utils/formatters/number';

type SynthBalancesTuple = [string[], ethers.BigNumber[], ethers.BigNumber[]];

export default class SynthsService {
	private sdk: KwentaSDK;
	private balances?: any;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getSynthBalances() {
		if (!this.sdk.walletAddress) {
			throw new Error('No wallet address provided');
		}

		if (!this.sdk.contracts.SynthUtil) {
			throw new Error('Wrong network selected');
		}

		const balancesMap: SynthBalancesMap = {};
		const [
			currencyKeys,
			synthsBalances,
			synthsUSDBalances,
		]: SynthBalancesTuple = await this.sdk.contracts.SynthUtil.connect(
			this.sdk.provider
		).synthsBalances(this.sdk.walletAddress);

		let totalUSDBalance = wei(0);

		currencyKeys.forEach((currencyKeyBytes32, idx) => {
			const balance = wei(synthsBalances[idx]);

			if (balance.gt(0)) {
				const synthName = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
				const usdBalance = wei(synthsUSDBalances[idx]);

				balancesMap[synthName] = { currencyKey: synthName, balance, usdBalance };

				totalUSDBalance = totalUSDBalance.add(usdBalance);
			}
		});

		const balances = {
			balancesMap,
			balances: orderBy(
				Object.values(balancesMap).filter(notNill),
				(balance) => balance.usdBalance.toNumber(),
				'desc'
			),
			totalUSDBalance,
			susdWalletBalance: balancesMap?.['sUSD']?.balance ?? zeroBN,
		};

		this.balances = balances;

		return balances;
	}

	public async getSynthBalance(currencyKey: string) {
		if (!this.balances) {
			await this.getSynthBalances();
		}

		return this.balances?.balancesMap[currencyKey]?.balance ?? zeroBN;
	}
}

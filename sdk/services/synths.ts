import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { orderBy } from 'lodash';
import KwentaSDK from 'sdk';

import { notNill } from 'queries/synths/utils';
import { SynthBalance } from 'sdk/types/tokens';
import { zeroBN } from 'utils/formatters/number';

import * as sdkErrors from '../common/errors';

type SynthBalancesTuple = [string[], ethers.BigNumber[], ethers.BigNumber[]];

export default class SynthsService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getSynthBalances(walletAddress: string) {
		if (!this.sdk.context.contracts.SynthUtil) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
		}

		const balancesMap: Record<string, SynthBalance> = {};
		const [
			currencyKeys,
			synthsBalances,
			synthsUSDBalances,
		]: SynthBalancesTuple = await this.sdk.context.contracts.SynthUtil.synthsBalances(
			walletAddress
		);

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

		return balances;
	}
}

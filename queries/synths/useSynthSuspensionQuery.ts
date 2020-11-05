import { useQuery, QueryConfig } from 'react-query';
import { BigNumberish, ethers } from 'ethers';

import QUERY_KEYS from 'constants/queryKeys';

import synthetix from 'lib/synthetix';

import { CurrencyKey } from 'constants/currency';

/*
	Suspension Reasons:

	1: "System Upgrade"
	2: "Market Closure"
	55: "Circuit Breaker (Phase one)"
	65: "Decentralized Circuit Breaker (Phase two)"
	99999: "Emergency"
*/

export type SynthSuspensionReason =
	| 'system-upgrade'
	| 'market-closure'
	| 'circuit-breaker'
	| 'emergency'
	| null;

const getReasonFromCode = (reasonCode: number): SynthSuspensionReason => {
	switch (reasonCode) {
		case 1:
			return 'system-upgrade';
		case 2:
			return 'market-closure';
		case 55:
		case 65:
			return 'circuit-breaker';
		case 99999:
			return 'emergency';
		default:
			return null;
	}
};

export type SynthSuspended = {
	isSuspended: boolean;
	reasonCode: number;
	reason: SynthSuspensionReason;
};

const useSynthSuspensionQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<SynthSuspended>
) => {
	return useQuery<SynthSuspended>(
		QUERY_KEYS.Synths.Suspension(currencyKey ?? ''),
		async () => {
			const [suspended, reason] = (await synthetix.js?.contracts.SystemStatus.synthSuspension(
				ethers.utils.formatBytes32String(currencyKey!)
			)) as [boolean, BigNumberish];

			const reasonCode = Number(reason);

			return {
				isSuspended: suspended,
				reasonCode,
				reason: getReasonFromCode(reasonCode),
			};
		},
		{
			enabled: synthetix.js && currencyKey != null,
			...options,
		}
	);
};

export default useSynthSuspensionQuery;

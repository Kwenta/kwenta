import { useQuery, QueryConfig } from 'react-query';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';

/*
	Suspension Reasons:

	1: "System Upgrade"
	2: "Market Closure"
	3: "Circuit Breaker"
	55: "Circuit Breaker (Phase one)"
	65: "Decentralized Circuit Breaker (Phase two)"
	99999: "Emergency"
*/

export type SynthSuspensionReason =
	| 'system-upgrade'
	| 'market-closure'
	| 'circuit-breaker'
	| 'emergency';

const getReasonFromCode = (reasonCode: number): SynthSuspensionReason => {
	switch (reasonCode) {
		case 1:
			return 'system-upgrade';
		case 2:
			return 'market-closure';
		case 3:
		case 55:
		case 65:
			return 'circuit-breaker';
		case 99999:
			return 'emergency';
		default:
			return 'market-closure';
	}
};

export type SynthSuspended = {
	isSuspended: boolean;
	reasonCode: number;
	reason: SynthSuspensionReason | null;
};

const useSynthSuspensionQuery = (
	currencyKey: CurrencyKey | null,
	options?: QueryConfig<SynthSuspended>
) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<SynthSuspended>(
		QUERY_KEYS.Synths.Suspension(currencyKey ?? ''),
		async () => {
			const [
				isSuspended,
				reason,
			] = (await synthetix.js?.contracts.SystemStatus.synthExchangeSuspension(
				ethers.utils.formatBytes32String(currencyKey!)
			)) as [boolean, ethers.BigNumber];

			const reasonCode = Number(reason);
			return {
				isSuspended,
				reasonCode,
				reason: isSuspended ? getReasonFromCode(reasonCode) : null,
			};
		},
		{
			enabled: isAppReady && currencyKey != null,
			...options,
		}
	);
};

export default useSynthSuspensionQuery;

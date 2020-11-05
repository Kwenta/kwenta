import { CurrencyKey } from 'constants/currency';

import useFrozenSynthsQuery from 'queries/synths/useFrozenSynthsQuery';
import useSynthSuspensionQuery from 'queries/synths/useSynthSuspensionQuery';

/*
	suspension reasons

	1: "System Upgrade"
	2: "Market Closure"
	55: "Circuit Breaker (Phase one)"
	65: "Decentralized Circuit Breaker (Phase two)"
	99999: "Emergency"
*/

export type MarketClosureReason = 'frozen' | number | undefined;

const useMarketClosed = (
	currencyKey: CurrencyKey
): {
	isMarketClosed: boolean;
	marketClosureReason: MarketClosureReason;
} => {
	const frozenSynthsQuery = useFrozenSynthsQuery();
	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const isCurrencyFrozen =
		frozenSynthsQuery.isSuccess && frozenSynthsQuery.data
			? frozenSynthsQuery.data.has(currencyKey)
			: false;

	const isCurrencySuspended =
		currencySuspendedQuery.isSuccess && currencySuspendedQuery.data
			? currencySuspendedQuery.data.isSuspended
			: false;

	return {
		isMarketClosed: isCurrencyFrozen || isCurrencySuspended,
		marketClosureReason: isCurrencyFrozen ? 'frozen' : currencySuspendedQuery.data?.reasonCode,
	};
};

export default useMarketClosed;

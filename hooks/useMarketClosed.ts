import { CurrencyKey } from 'constants/currency';

import useFrozenSynthsQuery from 'queries/synths/useFrozenSynthsQuery';
import useSynthSuspensionQuery, {
	SynthSuspensionReason,
} from 'queries/synths/useSynthSuspensionQuery';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {
	const frozenSynthsQuery = useFrozenSynthsQuery();
	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const isCurrencyFrozen =
		currencyKey != null && frozenSynthsQuery.isSuccess && frozenSynthsQuery.data
			? frozenSynthsQuery.data.has(currencyKey)
			: false;

	const isCurrencySuspended =
		currencySuspendedQuery.isSuccess && currencySuspendedQuery.data
			? currencySuspendedQuery.data.isSuspended
			: false;

	return {
		isMarketClosed: isCurrencyFrozen || isCurrencySuspended,
		isCurrencyFrozen,
		isCurrencySuspended,
		marketClosureReason: isCurrencyFrozen
			? 'frozen'
			: (currencySuspendedQuery.data?.reason as MarketClosureReason),
	};
};

export default useMarketClosed;

import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';

import { SynthSuspensionReason } from '@synthetixio/queries';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useMarketClosed>;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {
	const { useSynthSuspensionQuery } = useSynthetixQueries();

	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const isCurrencySuspended =
		currencySuspendedQuery.isSuccess && currencySuspendedQuery.data
			? currencySuspendedQuery.data.isSuspended
			: false;

	return {
		isMarketClosed: isCurrencySuspended,
		isCurrencySuspended,
		marketClosureReason: currencySuspendedQuery.data?.reason as MarketClosureReason,
	};
};

export default useMarketClosed;

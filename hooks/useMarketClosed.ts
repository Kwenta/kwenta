import useSynthetixQueries from '@synthetixio/queries';
import { SynthSuspensionReason } from '@synthetixio/queries';

import { CurrencyKey } from 'constants/currency';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useMarketClosed>;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {
	const { useSynthSuspensionQuery } = useSynthetixQueries();

	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const isMarketClosed =
		currencySuspendedQuery.isSuccess && currencySuspendedQuery.data
			? currencySuspendedQuery.data.isSuspended
			: false;

	return {
		isMarketClosed,
		marketClosureReason: currencySuspendedQuery.data?.reason as MarketClosureReason,
	};
};

export default useMarketClosed;

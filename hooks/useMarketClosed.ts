import useSynthetixQueries from '@synthetixio/queries';
import { SynthSuspensionReason } from '@synthetixio/queries';
import { useMemo } from 'react';

import { CurrencyKey } from 'constants/currency';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useMarketClosed>;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {
	const { useSynthSuspensionQuery } = useSynthetixQueries();
	const currencySuspendedQuery = useSynthSuspensionQuery(currencyKey);

	const { isMarketClosed, marketClosureReason } = useMemo(
		() => ({
			isMarketClosed: currencySuspendedQuery.data?.isSuspended ?? false,
			marketClosureReason: currencySuspendedQuery.data?.reason as MarketClosureReason,
		}),
		[currencySuspendedQuery?.data]
	);

	return { isMarketClosed, marketClosureReason };
};

export default useMarketClosed;

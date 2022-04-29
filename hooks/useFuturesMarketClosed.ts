import { SynthSuspensionReason } from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import useFuturesSuspensionQuery from 'queries/futures/useFuturesSuspensionQuery';

export type FuturesClosureReason = SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useFuturesMarketClosed>;

const useFuturesMarketClosed = (currencyKey: CurrencyKey | null) => {
	const futuresMarketSuspendedQuery = useFuturesSuspensionQuery(currencyKey);

	const isFutureMarketSuspended =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? futuresMarketSuspendedQuery.data.isFuturesMarketClosed
			: null;

	const reason =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? futuresMarketSuspendedQuery.data.futuresClosureReason
			: null;

	return {
		isFuturesMarketClosed: isFutureMarketSuspended,
		isFutureMarketSuspended,
		futuresClosureReason: reason as FuturesClosureReason,
	};
};

export default useFuturesMarketClosed;

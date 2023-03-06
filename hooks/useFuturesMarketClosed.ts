import useFuturesSuspensionQuery from 'queries/futures/useFuturesSuspensionQuery';
import { FuturesMarketKey, SynthSuspensionReason } from 'sdk/types/futures';

export type MarketClosure = ReturnType<typeof useFuturesMarketClosed>;

const useFuturesMarketClosed = (marketKey: FuturesMarketKey | null) => {
	const futuresMarketSuspendedQuery = useFuturesSuspensionQuery(marketKey);

	const isFuturesMarketClosed =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? futuresMarketSuspendedQuery.data.isFuturesMarketClosed
			: null;

	const reason =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? futuresMarketSuspendedQuery.data.futuresClosureReason
			: null;

	return {
		isFuturesMarketClosed,
		futuresClosureReason: reason as SynthSuspensionReason,
	};
};

export default useFuturesMarketClosed;

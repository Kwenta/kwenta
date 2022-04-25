import { CurrencyKey } from 'constants/currency';

import useFuturesSuspensionQuery, {
	FuturesSuspensionReason,
} from 'queries/futures/useFuturesSuspensionQuery';
import { getReasonFromCode } from 'queries/futures/utils';

export type MarketClosureReason = FuturesSuspensionReason;
export type MarketClosure = ReturnType<typeof useFuturesMarketClosed>;

const useFuturesMarketClosed = (currencyKey: CurrencyKey | null) => {
	const futuresMarketSuspendedQuery = useFuturesSuspensionQuery(currencyKey);

	const isFutureMarketSuspended =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? futuresMarketSuspendedQuery.data.isFuturesMarketClosed
			: false;

	const reason =
		futuresMarketSuspendedQuery.isSuccess && futuresMarketSuspendedQuery.data
			? getReasonFromCode(futuresMarketSuspendedQuery.data.futuresClosureReason)
			: null;

	return {
		isFuturesMarketClosed: isFutureMarketSuspended,
		isFutureMarketSuspended,
		futuresClosureReason: reason as FuturesSuspensionReason,
	};
};

export default useFuturesMarketClosed;

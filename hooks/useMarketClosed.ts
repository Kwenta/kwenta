import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';

import { SynthSuspensionReason } from '@synthetixio/queries';

export type MarketClosureReason = 'frozen' | SynthSuspensionReason;
export type MarketClosure = ReturnType<typeof useMarketClosed>;

const useMarketClosed = (currencyKey: CurrencyKey | null) => {

	const { network, provider } = Connector.useContainer();
	const { useFrozenSynthsQuery, useSynthSuspensionQuery } = useSynthetixQueries({
		networkId: network?.id ?? null,
		provider
	})

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

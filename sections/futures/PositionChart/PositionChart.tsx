import { useMemo } from 'react';
import { CurrencyKey } from '@synthetixio/contracts-interface';

import Connector from 'containers/Connector';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import { getMarketKey } from 'utils/futures';
import TvChartWrapper from '../TvChartWrapper';

type Props = {
	marketAsset: CurrencyKey;
};

export default function PositionChart({ marketAsset }: Props) {
	const { network } = Connector.useContainer();
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);

	const futuresPositionsQuery = useGetFuturesPositionForAccount({ refetchInterval: 5000 });
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const subgraphPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const activePosition = useMemo(() => {
		if (!futuresMarketsPosition?.position) {
			return null;
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a spoition
			avgEntryPrice: subgraphPosition?.avgEntryPrice || futuresMarketsPosition.position.lastPrice,
			size: futuresMarketsPosition.position.size,
			liquidationPrice: futuresMarketsPosition.position?.liquidationPrice,
		};
	}, [subgraphPosition, futuresMarketsPosition]);

	return <TvChartWrapper baseCurrencyKey={marketAsset} activePosition={activePosition} />;
}

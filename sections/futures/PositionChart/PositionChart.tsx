import { useMemo } from 'react';
import { CurrencyKey } from '@synthetixio/contracts-interface';

import Connector from 'containers/Connector';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { getMarketKey } from 'utils/futures';
import TvChartWrapper from '../TvChartWrapper';
import { PotentialTrade } from '../types';

type Props = {
	marketAsset: CurrencyKey;
	potentialTrade: PotentialTrade | null;
};

export default function PositionChart({ marketAsset, potentialTrade }: Props) {
	const { network } = Connector.useContainer();

	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);
	const potentialTradeDetails = useGetFuturesPotentialTradeDetails(marketAsset, potentialTrade);

	const futuresPositionsQuery = useGetFuturesPositionForAccount({ refetchInterval: 5000 });
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const subgraphPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const modifiedAverage = useMemo(() => {
		if (subgraphPosition && potentialTradeDetails.data && potentialTrade) {
			const totalSize = subgraphPosition.size.add(potentialTrade.size);

			const existingValue = subgraphPosition.avgEntryPrice.mul(subgraphPosition.size);
			const newValue = potentialTradeDetails.data.price.mul(potentialTrade.size);
			const totalValue = existingValue.add(newValue);
			return totalValue.div(totalSize);
		}
		return null;
	}, [subgraphPosition, potentialTradeDetails.data, potentialTrade]);

	const activePosition = useMemo(() => {
		if (!futuresMarketsPosition?.position) {
			return null;
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a position
			price: subgraphPosition?.avgEntryPrice || futuresMarketsPosition.position.lastPrice,
			size: futuresMarketsPosition.position.size,
			liqPrice: futuresMarketsPosition.position?.liquidationPrice,
		};
	}, [subgraphPosition, futuresMarketsPosition]);

	return (
		<TvChartWrapper
			baseCurrencyKey={marketAsset}
			activePosition={activePosition}
			potentialTrade={
				potentialTradeDetails?.data
					? {
							price: modifiedAverage || potentialTradeDetails.data.price,
							liqPrice: potentialTradeDetails.data.liqPrice,
							size: potentialTradeDetails.data.size,
					  }
					: null
			}
		/>
	);
}

import { useMemo } from 'react';
import { Synths } from 'constants/currency';
import { CurrencyKey } from '@synthetixio/contracts-interface';

import Connector from 'containers/Connector';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { getMarketKey } from 'utils/futures';

import TVChart from 'components/TVChart';
import { useRecoilValue } from 'recoil';
import { tradeSizeState } from 'store/futures';

type Props = {
	marketAsset: CurrencyKey;
};

export default function PositionChart({ marketAsset }: Props) {
	const { network } = Connector.useContainer();

	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);
	const potentialTradeDetails = useGetFuturesPotentialTradeDetails(marketAsset);

	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const subgraphPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const tradeSize = useRecoilValue(tradeSizeState);

	const modifiedAverage = useMemo(() => {
		if (subgraphPosition && potentialTradeDetails.data && !!tradeSize) {
			const totalSize = subgraphPosition.size.add(tradeSize);

			const existingValue = subgraphPosition.avgEntryPrice.mul(subgraphPosition.size);
			const newValue = potentialTradeDetails.data.price.mul(tradeSize);
			const totalValue = existingValue.add(newValue);
			return totalValue.div(totalSize);
		}
		return null;
	}, [subgraphPosition, potentialTradeDetails.data, tradeSize]);

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
		<TVChart
			baseCurrencyKey={marketAsset}
			quoteCurrencyKey={Synths.sUSD}
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

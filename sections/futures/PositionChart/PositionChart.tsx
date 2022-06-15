import { useMemo } from 'react';
import { Synths } from 'constants/currency';

import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';

import TVChart from 'components/TVChart';
import { useRecoilValue } from 'recoil';
import {
	currentMarketState,
	positionState,
	potentialTradeDetailsState,
	tradeSizeState,
} from 'store/futures';

export default function PositionChart() {
	const marketAsset = useRecoilValue(currentMarketState);
	const position = useRecoilValue(positionState);

	const previewTrade = useRecoilValue(potentialTradeDetailsState);

	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const subgraphPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);

	const tradeSize = useRecoilValue(tradeSizeState);

	const modifiedAverage = useMemo(() => {
		if (subgraphPosition && previewTrade && !!tradeSize) {
			const totalSize = subgraphPosition.size.add(tradeSize);

			const existingValue = subgraphPosition.avgEntryPrice.mul(subgraphPosition.size);
			const newValue = previewTrade.price.mul(tradeSize);
			const totalValue = existingValue.add(newValue);
			return totalValue.div(totalSize);
		}
		return null;
	}, [subgraphPosition, previewTrade, tradeSize]);

	const activePosition = useMemo(() => {
		if (!position?.position) {
			return null;
		}

		return {
			// As there's often a delay in subgraph sync we use the contract last
			// price until we get average price to keep it snappy on opening a position
			price: subgraphPosition?.avgEntryPrice || position.position.lastPrice,
			size: position.position.size,
			liqPrice: position.position?.liquidationPrice,
		};
	}, [subgraphPosition, position]);

	return (
		<TVChart
			baseCurrencyKey={marketAsset}
			quoteCurrencyKey={Synths.sUSD}
			activePosition={activePosition}
			potentialTrade={
				previewTrade
					? {
							price: modifiedAverage || previewTrade.price,
							liqPrice: previewTrade.liqPrice,
							size: previewTrade.size,
					  }
					: null
			}
		/>
	);
}

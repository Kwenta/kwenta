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

	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const existingPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const activePosition = useMemo(() => {
		if (!existingPosition || !futuresMarketsPosition) {
			return null;
		}

		return {
			size: existingPosition.size.toString(),
			avgEntryPrice: existingPosition.avgEntryPrice.toString(),
			liquidationPrice: futuresMarketsPosition.position?.liquidationPrice.toString(),
		};
	}, [existingPosition, futuresMarketsPosition]);

	return <TvChartWrapper baseCurrencyKey={marketAsset} activePosition={activePosition} />;
}

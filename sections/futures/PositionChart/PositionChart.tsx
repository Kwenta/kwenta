import { useEffect, useState } from 'react';
import { CurrencyKey } from '@synthetixio/contracts-interface';

import Connector from 'containers/Connector';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import { getMarketKey } from 'utils/futures';
import TvChartWrapper from '../TvChartWrapper';

type Props = {
	marketAsset: CurrencyKey;
};

type ChartPosition = {
	avgEntryPrice: string;
	size: string;
	liquidationPrice: string | undefined;
};

export default function PositionChart({ marketAsset }: Props) {
	const { network } = Connector.useContainer();
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);
	const [openPosition, setOpenPosition] = useState<ChartPosition | null>(null);

	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const positionHistory = futuresPositionsQuery?.data ?? [];
	const existingPosition = positionHistory.find((p) => p.isOpen && p.asset === marketAsset);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	useEffect(() => {
		if (!existingPosition || !futuresMarketsPosition) {
			setOpenPosition(null);
			return;
		}

		// Round liquidation price to avoid chart refreshes from tiny high precision liq price changes
		const liquidationPrice = futuresMarketsPosition.position?.liquidationPrice
			.toNumber()
			.toFixed(4);

		// Deep compare to avoid chart refreshes
		if (
			openPosition?.size !== existingPosition.size.toString() ||
			openPosition?.avgEntryPrice !== existingPosition.avgEntryPrice.toString() ||
			openPosition?.liquidationPrice !== liquidationPrice
		) {
			setOpenPosition({
				size: existingPosition.size.toString(),
				avgEntryPrice: existingPosition.avgEntryPrice.toString(),
				liquidationPrice: liquidationPrice,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [existingPosition, futuresMarketsPosition]);

	return <TvChartWrapper baseCurrencyKey={marketAsset} activePosition={openPosition} />;
}

import React, { FC } from 'react';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';
import { ChartPosition } from 'components/TVChart/types';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';

type TVChartWrapperProps = {
	baseCurrencyKey: CurrencyKey;
	activePosition?: ChartPosition | null;
	potentialTrade: ChartPosition | null;
};

export const TVChartWrapper: FC<TVChartWrapperProps> = ({
	baseCurrencyKey,
	activePosition,
	potentialTrade,
}) => {
	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(baseCurrencyKey);

	return isFuturesMarketClosed ? (
		<MarketOverlay marketClosureReason={futuresClosureReason} baseCurrencyKey={baseCurrencyKey} />
	) : (
		<TVChart
			baseCurrencyKey={baseCurrencyKey}
			quoteCurrencyKey={Synths.sUSD}
			activePosition={activePosition}
			potentialTrade={potentialTrade}
		/>
	);
};

export default TVChartWrapper;

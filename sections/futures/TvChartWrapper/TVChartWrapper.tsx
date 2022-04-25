import React, { FC } from 'react';
import useMarketClosed from 'hooks/useMarketClosed';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';
import { ChartPosition } from 'components/TVChart/types';

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
	const { isMarketClosed, marketClosureReason } = useMarketClosed(baseCurrencyKey);

	return isMarketClosed ? (
		<MarketOverlay marketClosureReason={marketClosureReason} baseCurrencyKey={baseCurrencyKey} />
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

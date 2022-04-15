import React, { FC } from 'react';
import useMarketClosed from 'hooks/useMarketClosed';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';

type TVChartWrapperProps = {
	baseCurrencyKey: CurrencyKey;
};

export const TVChartWrapper: FC<TVChartWrapperProps> = ({ baseCurrencyKey }) => {
	const { isMarketClosed, marketClosureReason } = useMarketClosed(baseCurrencyKey);

	return isMarketClosed ? (
		<MarketOverlay marketClosureReason={marketClosureReason} baseCurrencyKey={baseCurrencyKey} />
	) : (
		<TVChart baseCurrencyKey={baseCurrencyKey} quoteCurrencyKey={Synths.sUSD} />
	);
};

export default TVChartWrapper;

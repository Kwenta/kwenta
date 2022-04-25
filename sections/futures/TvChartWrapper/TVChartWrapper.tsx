import React, { FC } from 'react';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';

type TVChartWrapperProps = {
	baseCurrencyKey: CurrencyKey;
};

export const TVChartWrapper: FC<TVChartWrapperProps> = ({ baseCurrencyKey }) => {
	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(baseCurrencyKey);

	return isFuturesMarketClosed ? (
		<MarketOverlay marketClosureReason={futuresClosureReason} baseCurrencyKey={baseCurrencyKey} />
	) : (
		<TVChart baseCurrencyKey={baseCurrencyKey} quoteCurrencyKey={Synths.sUSD} />
	);
};

export default TVChartWrapper;

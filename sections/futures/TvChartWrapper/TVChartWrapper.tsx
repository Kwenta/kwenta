import React, { FC } from 'react';
import useMarketClosed from 'hooks/useMarketClosed';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';

type TVChartWrapperProps = {
	currencyKey: CurrencyKey;
};

export const TVChartWrapper: FC<TVChartWrapperProps> = ({ currencyKey }) => {
	const { isMarketClosed, marketClosureReason } = useMarketClosed(currencyKey);

	return isMarketClosed ? (
		<MarketOverlay marketClosureReason={marketClosureReason} currencyKey={currencyKey} />
	) : (
		<TVChart baseCurrencyKey={currencyKey} quoteCurrencyKey={Synths.sUSD} />
	);
};

export default TVChartWrapper;

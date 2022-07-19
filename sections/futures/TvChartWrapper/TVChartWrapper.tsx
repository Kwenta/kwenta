import React, { FC } from 'react';
import { CurrencyKey, Synths } from 'constants/currency';
import TVChart from 'components/TVChart';
import MarketOverlay from '../MarketOverlay';
import { ChartPosition } from 'components/TVChart/types';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import { useRecoilValue } from 'recoil';
import { marketKeyState } from 'store/futures';

type TVChartWrapperProps = {
	baseCurrencyKey: CurrencyKey;
	activePosition?: ChartPosition | null;
	potentialTrade: ChartPosition | null;
};

/**
 *
 * We are removing this component from the app because it is too
 * distracting when markets pause constantly (reason code 231).
 * Leaving the component here in case we want to bring it back later.
 */
export const TVChartWrapper: FC<TVChartWrapperProps> = ({
	baseCurrencyKey,
	activePosition,
	potentialTrade,
}) => {
	const marketKey = useRecoilValue(marketKeyState);
	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(marketKey);

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

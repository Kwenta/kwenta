import MarketDetail from 'sections/futures/MarketDetails/MarketDetail';
import { MarketDetailsContainer } from 'sections/futures/MarketDetails/MarketDetails';
import { MarketDataKey } from 'sections/futures/MarketDetails/utils';

export default {
	title: 'Futures/MarketStats',
};

export const Default = () => {
	return (
		<MarketDetailsContainer>
			<MarketDetail dataKey={MarketDataKey.marketPrice} value="100" />
			<MarketDetail dataKey={MarketDataKey.indexPrice} value="0" />
			<MarketDetail dataKey={MarketDataKey.dailyChange} value="0" />
			<MarketDetail dataKey={MarketDataKey.hourlyFundingRate} value="0" />
			<MarketDetail dataKey={MarketDataKey.openInterestLong} value="0" />
			<MarketDetail dataKey={MarketDataKey.openInterestShort} value="0" />
		</MarketDetailsContainer>
	);
};

export const Mobile = () => {
	return (
		<div style={{ width: 334 }}>
			<MarketDetailsContainer mobile>
				<MarketDetail dataKey={MarketDataKey.marketPrice} value="100" />
				<MarketDetail dataKey={MarketDataKey.indexPrice} value="0" />
				<MarketDetail dataKey={MarketDataKey.dailyChange} value="0" />
				<MarketDetail dataKey={MarketDataKey.hourlyFundingRate} value="0" />
				<MarketDetail dataKey={MarketDataKey.openInterestLong} value="0" />
				<MarketDetail dataKey={MarketDataKey.openInterestShort} value="0" />
			</MarketDetailsContainer>
		</div>
	);
};

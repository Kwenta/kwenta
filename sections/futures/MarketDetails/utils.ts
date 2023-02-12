const markets = [
	'sETH',
	'sBTC',
	'sLINK',
	'sSOL',
	'sAVAX',
	'sMATIC',
	'sAAVE',
	'sUNI',
	'sEUR',
	'sXAU',
	'sXAG',
	'sWTI',
	'sDYDX',
	'sAPE',
] as const;

const map: Record<typeof markets[number], string> = {
	sETH: 'ethereum',
	sBTC: 'bitcoin',
	sLINK: 'chainlink',
	sSOL: 'solana',
	sAVAX: 'avalanche-2',
	sMATIC: 'matic-network',
	sAAVE: 'aave',
	sUNI: 'uniswap',
	sEUR: 'euro',
	sXAU: '',
	sXAG: '',
	sWTI: '',
	sDYDX: 'dydx',
	sAPE: 'apecoin',
};

export enum MarketDataKey {
	indexPrice = 'Index Price',
	marketPrice = 'Market Price',
	dailyChange = '24H Change',
	dailyVolume = '24H Volume',
	dailyTrades = '24H Trades',
	openInterestLong = 'Open Interest (L)',
	openInterestShort = 'Open Interest (S)',
	instFundingRate = 'Inst. Funding Rate',
	hourlyFundingRate = '1H Funding Rate',
}

export const marketDataKeyMap: Record<MarketDataKey, string> = {
	[MarketDataKey.indexPrice]: 'index-price',
	[MarketDataKey.marketPrice]: 'market-price',
	[MarketDataKey.dailyChange]: '24h-change',
	[MarketDataKey.dailyVolume]: '24h-vol',
	[MarketDataKey.dailyTrades]: '24h-trades',
	[MarketDataKey.openInterestLong]: 'open-interest-l',
	[MarketDataKey.openInterestShort]: 'open-interest-s',
	[MarketDataKey.instFundingRate]: '1h-funding-rate',
	[MarketDataKey.hourlyFundingRate]: '1h-funding-rate',
};

export const isMarketDataKey = (key: string): key is MarketDataKey => {
	return Object.values<string>(MarketDataKey).includes(key);
};

export const synthToCoingeckoPriceId = (synth: any) => {
	if (markets.includes(synth)) {
		return map[synth as typeof markets[number]];
	} else {
		return 'ethereum';
	}
};

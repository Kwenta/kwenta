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

export const synthToCoingeckoPriceId = (synth: any) => {
	if (markets.includes(synth)) {
		return map[synth as typeof markets[number]];
	} else {
		return 'ethereum';
	}
};

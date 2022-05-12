import { Synths } from 'constants/currency';

const markets = [
	Synths.sETH,
	Synths.sBTC,
	Synths.sLINK,
	Synths.sSOL,
	Synths.sAVAX,
	Synths.sMATIC,
	Synths.sAAVE,
	Synths.sUNI,
	Synths.sEUR,
	'sXAU',
	'sXAG',
	'sWTI',
	'sDYDX',
	'sAPE',
] as const;

const map: Record<typeof markets[number], string> = {
	[Synths.sETH]: 'ethereum',
	[Synths.sBTC]: 'bitcoin',
	[Synths.sLINK]: 'chainlink',
	[Synths.sSOL]: 'solana',
	[Synths.sAVAX]: 'avalanche-2',
	[Synths.sMATIC]: 'matic-network',
	[Synths.sAAVE]: 'aave',
	[Synths.sUNI]: 'uniswap',
	[Synths.sEUR]: 'euro',
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

import { NetworkId, NetworkNameById, Synth } from '@synthetixio/contracts-interface';
import { TFunction } from 'i18next';
import { Dictionary } from 'lodash';

// import futuresMarketsKovan from 'synthetix/publish/deployed/kovan-ovm/futures-markets.json';
// import futuresMarketsMainnet from 'synthetix/publish/deployed/mainnet-ovm/futures-markets.json';
import { Synths } from 'constants/currency';

export const getMarketAsset = (marketKey: FuturesMarketKey) => {
	return markets[marketKey].asset;
};

export const getDisplayAsset = (asset: string | null) => {
	return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null;
};

export const getSynthDescription = (synth: string, synthsMap: Dictionary<Synth>, t: TFunction) => {
	const parsedSynthKey = synth ? (synth[0] !== 's' ? `s${synth}` : synth) : '';

	switch (parsedSynthKey) {
		case 'sWTI':
			return t('common.currency.futures-market-oil-short-name');
		case 'sXAU':
			return t('common.currency.futures-market-gold-short-name');
		case 'sXAG':
			return t('common.currency.futures-market-silver-short-name');
		case 'sAPE':
		case 'sDYDX':
			return t('common.currency.futures-market-short-name', {
				currencyName: getDisplayAsset(synth),
			});
		default:
			return t('common.currency.futures-market-short-name', {
				currencyName:
					parsedSynthKey && synthsMap[parsedSynthKey] ? synthsMap[parsedSynthKey].description : '',
			});
	}
};

export const isEurForex = (marketKeyOrAsset: string | undefined): boolean =>
	marketKeyOrAsset === Synths.sEUR || marketKeyOrAsset === 'EUR';

// Notes on the futures config:
// 1. On the FuturesMarketKey and FuturesMarketAsset enums:
//    We might be able to handle this more cleanly with objects/template literals,
//    but this feels more concrete.
//    Plese feel free to recommend better, cleaner methods of doing this.
//    One consideration to make when making changes to this structure is that
//    Synthetix has deviated from the "marketKey = 's' + marketAsset" pattern in the past.
// 2. On the "supports" property:
//    This prevents us from having to duplicate code across mainnet and testnet markets.
// 3. On "marketsForNetwork":
//    This allows us to get the markets list for either testnet/mainnet. It also throw an
//    error (which we should catch on the UI) when the user attempts to use a feature
//    that depends on this config on L1 (or other unsupported networks).

export enum FuturesMarketKey {
	sBTC = 'sBTC',
	sETH = 'sETH',
	sLINK = 'sLINK',
	sSOL = 'sSOL',
	sAVAX = 'sAVAX',
	sAAVE = 'sAAVE',
	sUNI = 'sUNI',
	sMATIC = 'sMATIC',
	sXAU = 'sXAU',
	sXAG = 'sXAG',
	sEUR = 'sEUR',
	sAPE = 'sAPE',
	sDYDX = 'sDYDX',
	sWTI = 'sWTI',
	sAXS = 'sAXS',
}

export enum FuturesMarketAsset {
	sBTC = 'sBTC',
	sETH = 'sETH',
	sLINK = 'sLINK',
	SOL = 'SOL',
	AVAX = 'AVAX',
	AAVE = 'AAVE',
	UNI = 'UNI',
	MATIC = 'MATIC',
	XAU = 'XAU',
	XAG = 'XAG',
	EUR = 'EUR',
	APE = 'APE',
	DYDX = 'DYDX',
	WTI = 'WTI',
	AXS = 'AXS',
}

export const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset> = {
	[FuturesMarketKey.sBTC]: FuturesMarketAsset.sBTC,
	[FuturesMarketKey.sETH]: FuturesMarketAsset.sETH,
	[FuturesMarketKey.sLINK]: FuturesMarketAsset.sLINK,
	[FuturesMarketKey.sSOL]: FuturesMarketAsset.SOL,
	[FuturesMarketKey.sAVAX]: FuturesMarketAsset.AVAX,
	[FuturesMarketKey.sAAVE]: FuturesMarketAsset.AAVE,
	[FuturesMarketKey.sUNI]: FuturesMarketAsset.UNI,
	[FuturesMarketKey.sMATIC]: FuturesMarketAsset.MATIC,
	[FuturesMarketKey.sXAU]: FuturesMarketAsset.XAU,
	[FuturesMarketKey.sXAG]: FuturesMarketAsset.XAG,
	[FuturesMarketKey.sEUR]: FuturesMarketAsset.EUR,
	[FuturesMarketKey.sAPE]: FuturesMarketAsset.APE,
	[FuturesMarketKey.sDYDX]: FuturesMarketAsset.DYDX,
	[FuturesMarketKey.sWTI]: FuturesMarketAsset.WTI,
	[FuturesMarketKey.sAXS]: FuturesMarketAsset.AXS,
} as const;

export const MarketKeyByAsset: Record<FuturesMarketAsset, FuturesMarketKey> = {
	[FuturesMarketAsset.sBTC]: FuturesMarketKey.sBTC,
	[FuturesMarketAsset.sETH]: FuturesMarketKey.sETH,
	[FuturesMarketAsset.sLINK]: FuturesMarketKey.sLINK,
	[FuturesMarketAsset.SOL]: FuturesMarketKey.sSOL,
	[FuturesMarketAsset.AVAX]: FuturesMarketKey.sAVAX,
	[FuturesMarketAsset.AAVE]: FuturesMarketKey.sAAVE,
	[FuturesMarketAsset.UNI]: FuturesMarketKey.sUNI,
	[FuturesMarketAsset.MATIC]: FuturesMarketKey.sMATIC,
	[FuturesMarketAsset.XAU]: FuturesMarketKey.sXAU,
	[FuturesMarketAsset.XAG]: FuturesMarketKey.sXAG,
	[FuturesMarketAsset.EUR]: FuturesMarketKey.sEUR,
	[FuturesMarketAsset.APE]: FuturesMarketKey.sAPE,
	[FuturesMarketAsset.DYDX]: FuturesMarketKey.sDYDX,
	[FuturesMarketAsset.WTI]: FuturesMarketKey.sWTI,
	[FuturesMarketAsset.AXS]: FuturesMarketKey.sAXS,
} as const;

export interface FuturesMarketConfig {
	key: FuturesMarketKey;
	asset: FuturesMarketAsset;
	supports: 'mainnet' | 'testnet' | 'both';
	disabled?: boolean;
}

export const markets: Record<FuturesMarketKey, FuturesMarketConfig> = {
	[FuturesMarketKey.sBTC]: {
		key: FuturesMarketKey.sBTC,
		asset: FuturesMarketAsset.sBTC,
		supports: 'both',
	},
	[FuturesMarketKey.sETH]: {
		key: FuturesMarketKey.sETH,
		asset: FuturesMarketAsset.sETH,
		supports: 'both',
	},
	[FuturesMarketKey.sLINK]: {
		key: FuturesMarketKey.sLINK,
		asset: FuturesMarketAsset.sLINK,
		supports: 'both',
	},
	[FuturesMarketKey.sSOL]: {
		key: FuturesMarketKey.sSOL,
		asset: FuturesMarketAsset.SOL,
		supports: 'both',
	},
	[FuturesMarketKey.sAVAX]: {
		key: FuturesMarketKey.sAVAX,
		asset: FuturesMarketAsset.AVAX,
		supports: 'both',
	},
	[FuturesMarketKey.sAAVE]: {
		key: FuturesMarketKey.sAAVE,
		asset: FuturesMarketAsset.AAVE,
		supports: 'both',
	},
	[FuturesMarketKey.sUNI]: {
		key: FuturesMarketKey.sUNI,
		asset: FuturesMarketAsset.UNI,
		supports: 'both',
	},
	[FuturesMarketKey.sMATIC]: {
		key: FuturesMarketKey.sMATIC,
		asset: FuturesMarketAsset.MATIC,
		supports: 'both',
	},
	[FuturesMarketKey.sXAU]: {
		key: FuturesMarketKey.sXAU,
		asset: FuturesMarketAsset.XAU,
		supports: 'both',
	},
	[FuturesMarketKey.sXAG]: {
		key: FuturesMarketKey.sXAG,
		asset: FuturesMarketAsset.XAG,
		supports: 'both',
	},
	[FuturesMarketKey.sEUR]: {
		key: FuturesMarketKey.sEUR,
		asset: FuturesMarketAsset.EUR,
		supports: 'both',
	},
	[FuturesMarketKey.sAPE]: {
		key: FuturesMarketKey.sAPE,
		asset: FuturesMarketAsset.APE,
		supports: 'both',
	},
	[FuturesMarketKey.sDYDX]: {
		key: FuturesMarketKey.sDYDX,
		asset: FuturesMarketAsset.DYDX,
		supports: 'mainnet',
	},
	[FuturesMarketKey.sWTI]: {
		key: FuturesMarketKey.sWTI,
		asset: FuturesMarketAsset.WTI,
		supports: 'testnet',
	},
	[FuturesMarketKey.sAXS]: {
		key: FuturesMarketKey.sAXS,
		asset: FuturesMarketAsset.AXS,
		supports: 'testnet',
	},
};

export const marketsList = Object.values(markets).filter((m) => !m.disabled);

export const mainnetMarkets = marketsList.filter(
	(m) => m.supports === 'mainnet' || m.supports === 'both'
);

export const testnetMarkets = marketsList.filter(
	(m) => m.supports === 'testnet' || m.supports === 'both'
);

export const marketsForNetwork = (networkId: NetworkId) => {
	const network = NetworkNameById[networkId];

	if (network === 'mainnet-ovm') {
		return mainnetMarkets;
	} else if (network === 'kovan-ovm') {
		return testnetMarkets;
	} else {
		throw new Error('You cannot use futures on this network.');
	}
};

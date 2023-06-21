import { NetworkId } from '../types/common';

export type SynthSymbol =
	| 'sAAVE'
	| 'sADA'
	| 'sAUD'
	| 'sBTC'
	| 'sCHF'
	| 'sDOT'
	| 'sETH'
	| 'sETHBTC'
	| 'sEUR'
	| 'sGBP'
	| 'sINR'
	| 'sJPY'
	| 'sKRW'
	| 'sLINK'
	| 'sUSD';

export type SynthToken = {
	name: SynthSymbol;
	description: string;
	asset: string;
	address: string;
	decimals: 18;
	category: 'crypto' | 'forex';
};

export type SynthsMap = Partial<Record<SynthSymbol, SynthToken>>;

type BasicSynth = {
	name: string;
	asset: string;
	addresses: Partial<Record<NetworkId, string>>;
	category: 'crypto' | 'forex';
};

export const synths: Record<SynthSymbol, BasicSynth> = {
	sAAVE: {
		name: 'Aave',
		asset: 'AAVE',
		addresses: {
			1: '0xd2dF355C19471c8bd7D8A3aa27Ff4e26A21b4076',
		},
		category: 'crypto',
	},
	sADA: {
		name: 'Cardano',
		asset: 'ADA',
		addresses: {
			1: '0xe36E2D3c7c34281FA3bC737950a68571736880A1',
		},
		category: 'crypto',
	},
	sAUD: {
		name: 'Australian Dollars',
		asset: 'AUD',
		addresses: {
			1: '0xF48e200EAF9906362BB1442fca31e0835773b8B4',
		},
		category: 'forex',
	},
	sBTC: {
		name: 'Bitcoin',
		asset: 'BTC',
		addresses: {
			1: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
			5: '0xf04fD9A2C265E7828832E9EFb01474b686CacD14',
			10: '0x298B9B95708152ff6968aafd889c6586e9169f1D',
			420: '0x23c7a77D22Fc1274eCecB703f74699500db106E6',
		},
		category: 'crypto',
	},
	sCHF: {
		name: 'Swiss Franc',
		asset: 'CHF',
		addresses: {
			1: '0x0F83287FF768D1c1e17a42F44d644D7F22e8ee1d',
		},
		category: 'forex',
	},
	sDOT: {
		name: 'Polkadot',
		asset: 'DOT',
		addresses: {
			1: '0x1715AC0743102BF5Cd58EfBB6Cf2dC2685d967b6',
		},
		category: 'crypto',
	},
	sETH: {
		name: 'Ethereum',
		asset: 'ETH',
		addresses: {
			1: '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb',
			5: '0x37216d2366B68Bd8bC64Eb01B83EFA765C21b483',
			10: '0xE405de8F52ba7559f9df3C368500B6E6ae6Cee49',
			420: '0x6c3856488e664C6b0380AAEfBFD1c28cd6727eC8',
		},
		category: 'crypto',
	},
	sETHBTC: {
		asset: 'ETHBTC',
		name: 'ETH / BTC',
		addresses: {
			1: '0x104eDF1da359506548BFc7c25bA1E28C16a70235',
		},
		category: 'crypto',
	},
	sEUR: {
		name: 'Euro',
		asset: 'EUR',
		addresses: {
			1: '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
			10: '0xFBc4198702E81aE77c06D58f81b629BDf36f0a71',
		},
		category: 'forex',
	},
	sGBP: {
		name: 'Pound Sterling',
		asset: 'GBP',
		addresses: {
			1: '0x97fe22E7341a0Cd8Db6F6C021A24Dc8f4DAD855F',
		},
		category: 'forex',
	},
	sINR: {
		name: 'Indian Rupees',
		asset: 'INR',
		addresses: {
			10: '0xa3A538EA5D5838dC32dde15946ccD74bDd5652fF',
		},
		category: 'forex',
	},
	sJPY: {
		name: 'Japanese Yen',
		asset: 'JPY',
		addresses: {
			1: '0xF6b1C627e95BFc3c1b4c9B825a032Ff0fBf3e07d',
		},
		category: 'forex',
	},
	sKRW: {
		name: 'South Korean Won',
		asset: 'KRW',
		addresses: {
			1: '0x269895a3dF4D73b077Fc823dD6dA1B95f72Aaf9B',
		},
		category: 'forex',
	},
	sLINK: {
		name: 'Chainlink',
		asset: 'LINK',
		addresses: {
			1: '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
		},
		category: 'crypto',
	},
	sUSD: {
		name: 'US Dollars',
		asset: 'USD',
		addresses: {
			1: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
			5: '0xB1f664162c0269A469a699709D37cc5739379dD1',
			10: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
			420: '0xeBaEAAD9236615542844adC5c149F86C36aD1136',
		},
		category: 'forex',
	},
};

const synthsByNetwork = (id: NetworkId) =>
	Object.entries(synths).reduce((acc, [symbol, config]) => {
		const address = config.addresses[id];

		if (address) {
			acc[symbol as SynthSymbol] = {
				name: symbol as SynthSymbol,
				description: config.name,
				asset: config.asset,
				address,
				decimals: 18,
				category: config.category,
			};
		}

		return acc;
	}, {} as Partial<SynthsMap>);

const SYNTHS_BY_NETWORK: Partial<Record<NetworkId, { map: SynthsMap; list: SynthToken[] }>> = {
	1: {
		map: synthsByNetwork(1),
		list: Object.values(synthsByNetwork(1)),
	},
	10: {
		map: synthsByNetwork(10),
		list: Object.values(synthsByNetwork(10)),
	},
	5: {
		map: synthsByNetwork(5),
		list: Object.values(synthsByNetwork(5)),
	},
	420: {
		map: synthsByNetwork(420),
		list: Object.values(synthsByNetwork(420)),
	},
};

export const getSynthsForNetwork = (networkId: NetworkId) => {
	return SYNTHS_BY_NETWORK[networkId]?.map ?? {};
};

export const getSynthsListForNetwork = (networkId: NetworkId) => {
	return SYNTHS_BY_NETWORK[networkId]?.list ?? [];
};

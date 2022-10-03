import { NetworkId, NetworkNameById } from '@synthetixio/contracts-interface';

import { booleanTypeGuard } from '../contracts';

type SynthSymbol =
	| 'sAAVE'
	| 'sADA'
	| 'sAUD'
	| 'sAVAX'
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
	| 'sMATIC'
	| 'sSOL'
	| 'sUNI'
	| 'sUSD';

export type SynthToken = {
	symbol: SynthSymbol;
	asset: string;
	name: string;
	address: string;
	decimals: 18;
};

export type SynthsMap = Record<SynthSymbol, SynthToken>;

type BasicSynth = {
	name: string;
	asset: string;
	addresses: Partial<Record<NetworkId, string>>;
};

export const synths: Record<SynthSymbol, BasicSynth> = {
	sAAVE: {
		name: 'Aave',
		asset: 'AAVE',
		addresses: {
			1: '0xd2dF355C19471c8bd7D8A3aa27Ff4e26A21b4076',
			10: '0x00B8D5a5e1Ac97Cb4341c4Bc4367443c8776e8d9',
		},
	},
	sADA: {
		name: 'Cardano',
		asset: 'ADA',
		addresses: {
			1: '0xe36E2D3c7c34281FA3bC737950a68571736880A1',
		},
	},
	sAUD: {
		name: 'Australian Dollars',
		asset: 'AUD',
		addresses: {
			1: '0xF48e200EAF9906362BB1442fca31e0835773b8B4',
		},
	},
	sAVAX: {
		name: 'Avalanche',
		asset: 'AVAX',
		addresses: {
			10: '0xB2b42B231C68cbb0b4bF2FFEbf57782Fd97D3dA4',
		},
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
	},
	sCHF: {
		name: 'Swiss Franc',
		asset: 'CHF',
		addresses: {
			1: '0x0F83287FF768D1c1e17a42F44d644D7F22e8ee1d',
		},
	},
	sDOT: {
		name: 'Polkadot',
		asset: 'DOT',
		addresses: {
			1: '0x1715AC0743102BF5Cd58EfBB6Cf2dC2685d967b6',
		},
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
	},
	sETHBTC: {
		asset: 'ETHBTC',
		name: 'ETH / BTC',
		addresses: {
			1: '0x104eDF1da359506548BFc7c25bA1E28C16a70235',
		},
	},
	sEUR: {
		name: 'Euro',
		asset: 'EUR',
		addresses: {
			1: '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
			10: '0xFBc4198702E81aE77c06D58f81b629BDf36f0a71',
		},
	},
	sGBP: {
		name: 'Pound Sterling',
		asset: 'GBP',
		addresses: {
			1: '0x97fe22E7341a0Cd8Db6F6C021A24Dc8f4DAD855F',
		},
	},
	sINR: {
		name: 'Indian Rupees',
		asset: 'INR',
		addresses: {
			10: '0xa3A538EA5D5838dC32dde15946ccD74bDd5652fF',
		},
	},
	sJPY: {
		name: 'Japanese Yen',
		asset: 'JPY',
		addresses: {
			1: '0xF6b1C627e95BFc3c1b4c9B825a032Ff0fBf3e07d',
		},
	},
	sKRW: {
		name: 'South Korean Won',
		asset: 'KRW',
		addresses: {
			1: '0x269895a3dF4D73b077Fc823dD6dA1B95f72Aaf9B',
		},
	},
	sLINK: {
		name: 'Chainlink',
		asset: 'LINK',
		addresses: {
			1: '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
			10: '0xc5Db22719A06418028A40A9B5E9A7c02959D0d08',
		},
	},
	sMATIC: {
		name: 'Matic',
		asset: 'MATIC',
		addresses: {
			10: '0x81DDfAc111913d3d5218DEA999216323B7CD6356',
		},
	},
	sSOL: {
		name: 'Solana',
		asset: 'SOL',
		addresses: {
			10: '0x8b2F7Ae8cA8EE8428B6D76dE88326bB413db2766',
		},
	},
	sUNI: {
		name: 'Uniswap',
		asset: 'UNI',
		addresses: {
			10: '0xf5a6115Aa582Fd1BEEa22BC93B7dC7a785F60d03',
		},
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
	},
};

// SNX
// 1 - 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F
// 5 - 0x51f44ca59b867E005e48FA573Cb8df83FC7f7597
// 10 - 0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4
// 420 - 0x2E5ED97596a8368EB9E44B1f3F25B2E813845303

const synthsByNetwork = (id: NetworkId): SynthsMap =>
	Object.fromEntries(
		Object.entries(synths)
			.map(([symbol, config]) => {
				if (config.addresses[id]) {
					return [
						symbol,
						{
							symbol,
							asset: config.asset,
							name: config.name,
							address: config.addresses[id],
							decimals: 18,
						},
					];
				} else {
					return null;
				}
			})
			.filter(booleanTypeGuard)
	);

const mainnetSynths = synthsByNetwork(1);
const optimismSynths = synthsByNetwork(10);
const kovanSynths = synthsByNetwork(42);
const optimismKovanSynths = synthsByNetwork(69);
const goerliSynths = synthsByNetwork(5);
const optimismGoerliSynths = synthsByNetwork(420);

export const getSynthsForNetwork = (networkId: NetworkId) => {
	switch (NetworkNameById[networkId]) {
		case 'mainnet':
			return mainnetSynths;
		case 'mainnet-ovm':
			return optimismSynths;
		case 'kovan':
			return kovanSynths;
		case 'kovan-ovm':
			return optimismKovanSynths;
		case 'goerli':
			return goerliSynths;
		case 'goerli-ovm':
			return optimismGoerliSynths;
		default:
			throw new Error('We do not support synths on the selected network.');
	}
};

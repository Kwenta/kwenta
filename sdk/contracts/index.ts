import { NetworkId } from '@synthetixio/contracts-interface';
import { Contract } from 'ethers';

import {
	ExchangerABI,
	SystemStatusABI,
	ExchangeRatesABI,
	SynthUtilABI,
	SystemSettingsABI,
	SynthRedeemerABI,
	FuturesMarketDataABI,
	FuturesMarketSettingsABI,
	FuturesMarketABI,
	SynthABI,
	SynthetixABI,
	StakingRewardsABI,
	KwentaArrakisVaultABI,
} from './abis/main';

export type ContractName =
	| 'Exchanger'
	| 'SystemStatus'
	| 'ExchangeRates'
	| 'SynthUtil'
	| 'SystemSettings'
	| 'SynthRedeemer'
	| 'FuturesMarketData'
	| 'FuturesMarketSettings'
	| 'FuturesMarket'
	| 'Synth'
	| 'Synthetix'
	| 'SynthSwap'
	| 'MarginAccountFactory'
	| 'MarginBaseSettings'
	| 'StakingRewards'
	| 'KwentaArrakisVault';

export type AllContractsMap = Record<
	ContractName,
	{ addresses: Partial<Record<NetworkId, string>>; abi: string[] }
>;

export type ContractMap = Partial<Record<ContractName, Contract>>;

export const contracts: AllContractsMap = {
	Exchanger: {
		addresses: {
			1: '0xD64D83829D92B5bdA881f6f61A4e4E27Fc185387',
			5: '0x889d8a97f43809Ef3FBb002B4b7a6A65319B61eD',
			10: '0xcC02F000b0aA8a0eFC2B55C9cf2305Fb3531cca1',
			420: '0x601A1Cf1a34d9cF0020dCCD361c155Fe54CE24fB',
		},
		abi: ExchangerABI,
	},
	SystemStatus: {
		addresses: {
			1: '0x696c905F8F8c006cA46e9808fE7e00049507798F',
			5: '0x31541f35F6Bd061f4A894fB7eEE565f81EE50df3',
			10: '0xE8c41bE1A167314ABAF2423b72Bf8da826943FFD',
			420: '0x9D89fF8C6f3CC22F4BbB859D0F85FB3a4e1FA916',
		},
		abi: SystemStatusABI,
	},
	ExchangeRates: {
		addresses: {
			1: '0xb4dc5ced63C2918c89E491D19BF1C0e92845de7C',
			5: '0xea765947303051507033202CAB7D3f5d4961CF5d',
			10: '0x22602469d704BfFb0936c7A7cfcD18f7aA269375',
			420: '0x280E5dFaA78CE685a846830bAe5F2FD21d6A3D89',
		},
		abi: ExchangeRatesABI,
	},
	SynthUtil: {
		addresses: {
			1: '0x81Aee4EA48f678E172640fB5813cf7A96AFaF6C3',
			5: '0x492395BA6866EF703DA49667fF92Cb8551e7a2D1',
			10: '0x87b1481c82913301Fc6c884Ac266a7c430F92cFA',
			420: '0xC647DecC9c4f9162dBF77E4367199F5ED0950355',
		},
		abi: SynthUtilABI,
	},
	SystemSettings: {
		addresses: {
			1: '0x5ad055A1F8C936FB0deb7024f1539Bb3eAA8dc3E',
			5: '0xA1B0898C54124E06aEAa823dC46ad0C306Ca6CD5',
			10: '0x05E1b1Dff853B1D67828Aa5E8CB37cC25aA050eE',
			420: '0xD2cECA6DD62243aB2d342Eb04882c86a10b35274',
		},
		abi: SystemSettingsABI,
	},
	SynthRedeemer: {
		addresses: {
			1: '0xe533139Af961c9747356D947838c98451015e234',
			5: '0x32A0BAA5Acec418a85Fd032f0292893B8E4f743B',
			10: '0xA997BD647AEe62Ef03b41e6fBFAdaB43d8E57535',
			420: '0x2A8338199D802620B4516a557195a498595d7Eb6',
		},
		abi: SynthRedeemerABI,
	},
	FuturesMarketData: {
		addresses: {
			10: '0xC51aeDBEC3aCD26650a7E85B6909E8AEc4d0F19e',
			420: '0x3FAe35Cfea950Fada314589213BABC54A084d5Bf',
		},
		abi: FuturesMarketDataABI,
	},
	FuturesMarketSettings: {
		addresses: {
			10: '0xaE55F163337A2A46733AA66dA9F35299f9A46e9e',
			420: '0x0dde87714C3bdACB93bB1d38605aFff209a85998',
		},
		abi: FuturesMarketSettingsABI,
	},
	FuturesMarket: {
		addresses: {
			10: '0xf86048DFf23cF130107dfB4e6386f574231a5C65',
			420: '0x0D10c032ad006C98C33A95e59ab3BA2b0849bD59',
		},
		abi: FuturesMarketABI,
	},
	Synth: {
		addresses: {
			1: '0x10A5F7D9D65bCc2734763444D4940a31b109275f',
			10: '0xDfA2d3a0d32F870D87f8A0d7AA6b9CdEB7bc5AdB',
		},
		abi: SynthABI,
	},
	Synthetix: {
		addresses: {
			1: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
			5: '0x51f44ca59b867E005e48FA573Cb8df83FC7f7597',
			10: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
			420: '0x2E5ED97596a8368EB9E44B1f3F25B2E813845303',
		},
		abi: SynthetixABI,
	},
	SynthSwap: {
		addresses: {
			10: '0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6',
		},
		abi: [],
	},
	MarginAccountFactory: {
		addresses: {
			10: '0x1fcFf1c7911dc209bdFc1648E5cDdB320f08AC08',
			420: '0x73a70947fe787A4167a27f8bd876349b7206ee77',
		},
		abi: [],
	},
	MarginBaseSettings: {
		addresses: {
			10: '0x8954C7b1417E3De398c7F33520EbAe142929Ba2A',
			420: '0x8d1CB3f153D4646b64A447809e1Ce7714d41C6B4',
		},
		abi: [],
	},
	StakingRewards: {
		addresses: {
			10: '0x6077987e8e06c062094c33177Eb12c4A65f90B65',
		},
		abi: StakingRewardsABI,
	},
	KwentaArrakisVault: {
		addresses: {
			10: '0x56dEa47c40877c2aaC2a689aC56aa56cAE4938d2',
		},
		abi: KwentaArrakisVaultABI,
	},
};

const contractsByNetwork = (id: NetworkId) =>
	Object.entries(contracts).reduce((acc, [name, { addresses, abi }]) => {
		const address = addresses[id];
		if (address) acc[name as ContractName] = new Contract(address, abi);
		return acc;
	}, {} as ContractMap);

const CONTRACTS_BY_NETWORK: Partial<Record<NetworkId, ContractMap>> = {
	1: contractsByNetwork(1),
	10: contractsByNetwork(10),
	5: contractsByNetwork(5),
	420: contractsByNetwork(420),
};

export const getContractsByNetwork = (networkId: NetworkId) => {
	return CONTRACTS_BY_NETWORK[networkId] ?? {};
};

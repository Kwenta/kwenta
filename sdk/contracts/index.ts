import { NetworkId, NetworkNameById } from '@synthetixio/contracts-interface';
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
	| 'Synthetix';

export type ContractDetails = {
	name: ContractName;
	networks: Partial<Record<NetworkId, { address: string; contract: Contract }>>;
};

export type AllContractsMap = Record<ContractName, Partial<Record<NetworkId, Contract>>>;

export type ContractMap = Partial<Record<ContractName, Contract>>;

export const contracts: AllContractsMap = {
	Exchanger: {
		1: new Contract('0xD64D83829D92B5bdA881f6f61A4e4E27Fc185387', ExchangerABI),
		5: new Contract('0x889d8a97f43809Ef3FBb002B4b7a6A65319B61eD', ExchangerABI),
		10: new Contract('0xcC02F000b0aA8a0eFC2B55C9cf2305Fb3531cca1', ExchangerABI),
		420: new Contract('0x601A1Cf1a34d9cF0020dCCD361c155Fe54CE24fB', ExchangerABI),
	},
	SystemStatus: {
		1: new Contract('0x696c905F8F8c006cA46e9808fE7e00049507798F', SystemStatusABI),
		5: new Contract('0x31541f35F6Bd061f4A894fB7eEE565f81EE50df3', SystemStatusABI),
		10: new Contract('0xE8c41bE1A167314ABAF2423b72Bf8da826943FFD', SystemStatusABI),
		420: new Contract('0x9D89fF8C6f3CC22F4BbB859D0F85FB3a4e1FA916', SystemStatusABI),
	},
	ExchangeRates: {
		1: new Contract('0xb4dc5ced63C2918c89E491D19BF1C0e92845de7C', ExchangeRatesABI),
		5: new Contract('0xea765947303051507033202CAB7D3f5d4961CF5d', ExchangeRatesABI),
		10: new Contract('0x22602469d704BfFb0936c7A7cfcD18f7aA269375', ExchangeRatesABI),
		420: new Contract('0x280E5dFaA78CE685a846830bAe5F2FD21d6A3D89', ExchangeRatesABI),
	},
	SynthUtil: {
		1: new Contract('0x81Aee4EA48f678E172640fB5813cf7A96AFaF6C3', SynthUtilABI),
		5: new Contract('0x492395BA6866EF703DA49667fF92Cb8551e7a2D1', SynthUtilABI),
		10: new Contract('0x87b1481c82913301Fc6c884Ac266a7c430F92cFA', SynthUtilABI),
		420: new Contract('0xC647DecC9c4f9162dBF77E4367199F5ED0950355', SynthUtilABI),
	},
	SystemSettings: {
		1: new Contract('0x5ad055A1F8C936FB0deb7024f1539Bb3eAA8dc3E', SystemSettingsABI),
		5: new Contract('0xA1B0898C54124E06aEAa823dC46ad0C306Ca6CD5', SystemSettingsABI),
		10: new Contract('0x05E1b1Dff853B1D67828Aa5E8CB37cC25aA050eE', SystemSettingsABI),
		420: new Contract('0xD2cECA6DD62243aB2d342Eb04882c86a10b35274', SystemSettingsABI),
	},
	SynthRedeemer: {
		1: new Contract('0xe533139Af961c9747356D947838c98451015e234', SynthRedeemerABI),
		5: new Contract('0x32A0BAA5Acec418a85Fd032f0292893B8E4f743B', SynthRedeemerABI),
		10: new Contract('0xA997BD647AEe62Ef03b41e6fBFAdaB43d8E57535', SynthRedeemerABI),
		420: new Contract('0x2A8338199D802620B4516a557195a498595d7Eb6', SynthRedeemerABI),
	},
	FuturesMarketData: {
		10: new Contract('0xC51aeDBEC3aCD26650a7E85B6909E8AEc4d0F19e', FuturesMarketDataABI),
		420: new Contract('0x3FAe35Cfea950Fada314589213BABC54A084d5Bf', FuturesMarketDataABI),
	},
	FuturesMarketSettings: {
		10: new Contract('0xaE55F163337A2A46733AA66dA9F35299f9A46e9e', FuturesMarketSettingsABI),
		420: new Contract('0x0dde87714C3bdACB93bB1d38605aFff209a85998', FuturesMarketSettingsABI),
	},
	FuturesMarket: {
		10: new Contract('0xf86048DFf23cF130107dfB4e6386f574231a5C65', FuturesMarketABI),
		420: new Contract('0x0D10c032ad006C98C33A95e59ab3BA2b0849bD59', FuturesMarketABI),
	},
	Synth: {
		1: new Contract('0x10A5F7D9D65bCc2734763444D4940a31b109275f', SynthABI),
		42: new Contract('0x4bf55262c17388C13CDD9538A830b32191493667', SynthABI),
		10: new Contract('0xDfA2d3a0d32F870D87f8A0d7AA6b9CdEB7bc5AdB', SynthABI),
		69: new Contract('0xbdb2Bf553b5f9Ca3327809F3748b86C106719C95', SynthABI),
	},
	Synthetix: {
		1: new Contract('0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', SynthetixABI),
		5: new Contract('0x51f44ca59b867E005e48FA573Cb8df83FC7f7597', SynthetixABI),
		10: new Contract('0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4', SynthetixABI),
		420: new Contract('0x2E5ED97596a8368EB9E44B1f3F25B2E813845303', SynthetixABI),
	},
};

const contractsByNetwork = (id: NetworkId) =>
	Object.entries(contracts).reduce((acc, [name, config]) => {
		if (config[id]) acc[name as ContractName] = config[id];
		return acc;
	}, {} as ContractMap);

const mainnetContracts = contractsByNetwork(1);
const optimismContracts = contractsByNetwork(10);
const goerliContracts = contractsByNetwork(5);
const optimismGoerliContracts = contractsByNetwork(420);

export const getContractsByNetwork = (networkId: NetworkId) => {
	switch (NetworkNameById[networkId]) {
		case 'mainnet':
			return mainnetContracts;
		case 'mainnet-ovm':
			return optimismContracts;
		case 'goerli':
			return goerliContracts;
		case 'goerli-ovm':
			return optimismGoerliContracts;
		default:
			throw new Error('We do not support contracts on the selected network.');
	}
};

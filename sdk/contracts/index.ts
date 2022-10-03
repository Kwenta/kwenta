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
	| 'Synth';

export type ContractDetails = {
	name: ContractName;
	networks: Partial<Record<NetworkId, { address: string; contract: Contract }>>;
};

export type AllContractsMap = Record<ContractName, Partial<Record<NetworkId, Contract>>>;

export type ContractMap = Partial<Record<ContractName, Contract>>;

export const contracts: AllContractsMap = {
	Exchanger: {
		1: new Contract('0xD64D83829D92B5bdA881f6f61A4e4E27Fc185387', ExchangerABI),
		42: new Contract('0xb9713D033DF6190D941F169cDEDc1C69B5314e72', ExchangerABI),
		10: new Contract('0xcC02F000b0aA8a0eFC2B55C9cf2305Fb3531cca1', ExchangerABI),
		69: new Contract('0xfff685537fdbD9CA07BD863Ac0b422863BF3114f', ExchangerABI),
	},
	SystemStatus: {
		1: new Contract('0x696c905F8F8c006cA46e9808fE7e00049507798F', SystemStatusABI),
		42: new Contract('0x648727A32112e6C233c1c5d8d57A9AA736FfB18B', SystemStatusABI),
		10: new Contract('0xE8c41bE1A167314ABAF2423b72Bf8da826943FFD', SystemStatusABI),
		69: new Contract('0xE90F90DCe5010F615bEC29c5db2D9df798D48183', SystemStatusABI),
	},
	ExchangeRates: {
		1: new Contract('0xb4dc5ced63C2918c89E491D19BF1C0e92845de7C', ExchangeRatesABI),
		42: new Contract('0x412c870daAb642aA87715e2EA860d20E48E73267', ExchangeRatesABI),
		10: new Contract('0x22602469d704BfFb0936c7A7cfcD18f7aA269375', ExchangeRatesABI),
		69: new Contract('0x37488De9A5Eaf311840D4B21a5B35A16bcb69603', ExchangeRatesABI),
	},
	SynthUtil: {
		1: new Contract('0x81Aee4EA48f678E172640fB5813cf7A96AFaF6C3', SynthUtilABI),
		42: new Contract('0xC88AE3be40CAa09CD16Db5816e6145E0E929c93c', SynthUtilABI),
		10: new Contract('0x87b1481c82913301Fc6c884Ac266a7c430F92cFA', SynthUtilABI),
		69: new Contract('0x5DF689ea1FB350bcB177Ff5e66ED8Dfe28C6045D', SynthUtilABI),
	},
	SystemSettings: {
		1: new Contract('0x5ad055A1F8C936FB0deb7024f1539Bb3eAA8dc3E', SystemSettingsABI),
		42: new Contract('0x6125A3d79bd03A35844bF5Bb2D977ed178e4e726', SystemSettingsABI),
		10: new Contract('0x05E1b1Dff853B1D67828Aa5E8CB37cC25aA050eE', SystemSettingsABI),
		69: new Contract('0x56D751dbE802fb91C3e6389c0e442B4cC8cAb78C', SystemSettingsABI),
	},
	SynthRedeemer: {
		1: new Contract('0xe533139Af961c9747356D947838c98451015e234', SynthRedeemerABI),
		42: new Contract('0xFa01a0494913b150Dd37CbE1fF775B08f108dEEa', SynthRedeemerABI),
		10: new Contract('0xA997BD647AEe62Ef03b41e6fBFAdaB43d8E57535', SynthRedeemerABI),
		69: new Contract('0x057Af46c8f48D9bc574d043e46DBF33fbaE023EA', SynthRedeemerABI),
	},
	FuturesMarketData: {
		10: new Contract('0xC51aeDBEC3aCD26650a7E85B6909E8AEc4d0F19e', FuturesMarketDataABI),
		69: new Contract('0x92CA72696B15b0F0C239E838148495016950af51', FuturesMarketDataABI),
	},
	FuturesMarketSettings: {
		10: new Contract('0xaE55F163337A2A46733AA66dA9F35299f9A46e9e', FuturesMarketSettingsABI),
		69: new Contract('0xEA567e05844ba0e257D80F6b579a1C2beB82bfCB', FuturesMarketSettingsABI),
	},
	FuturesMarket: {
		10: new Contract('0xf86048DFf23cF130107dfB4e6386f574231a5C65', FuturesMarketABI),
		69: new Contract('0x698E403AaC625345C6E5fC2D0042274350bEDf78', FuturesMarketABI),
	},
	Synth: {
		1: new Contract('0x10A5F7D9D65bCc2734763444D4940a31b109275f', SynthABI),
		42: new Contract('0x4bf55262c17388C13CDD9538A830b32191493667', SynthABI),
		10: new Contract('0xDfA2d3a0d32F870D87f8A0d7AA6b9CdEB7bc5AdB', SynthABI),
		69: new Contract('0xbdb2Bf553b5f9Ca3327809F3748b86C106719C95', SynthABI),
	},
};

export const booleanTypeGuard = <T>(x: T | null): x is T => Boolean(x);

const contractsByNetwork = (id: NetworkId): ContractMap =>
	Object.fromEntries(
		Object.entries(contracts)
			.map(([name, config]) => {
				if (config[id]) {
					return [name, config[id]];
				} else {
					return null;
				}
			})
			.filter(booleanTypeGuard)
	);

const mainnetContracts = contractsByNetwork(1);
const optimismContracts = contractsByNetwork(10);
const kovanContracts = contractsByNetwork(42);
const optimismKovanContracts = contractsByNetwork(69);
const goerliContracts = contractsByNetwork(5);
const optimismGoerliContracts = contractsByNetwork(420);

export const getContractsByNetwork = (networkId: NetworkId) => {
	switch (NetworkNameById[networkId]) {
		case 'mainnet':
			return mainnetContracts;
		case 'mainnet-ovm':
			return optimismContracts;
		case 'kovan':
			return kovanContracts;
		case 'kovan-ovm':
			return optimismKovanContracts;
		case 'goerli':
			return goerliContracts;
		case 'goerli-ovm':
			return optimismGoerliContracts;
		default:
			throw new Error('We do not support contracts on the selected network.');
	}
};

import initSnxJS, { NetworkId } from '@synthetixio/js';
import { ethers, Signer } from 'ethers';

import synthSummaryUtilContract from './contracts/synthSummaryUtilContract';
import keyBy from 'lodash/keyBy';
import { CurrencyKey, Category } from 'constants/currency';

export type SynthDefinition = {
	name: CurrencyKey;
	asset: string;
	category: Category;
	sign: string;
	desc: string;
	aggregator: string;
	inverted?: {
		entryPoint: number;
		upperLimit: number;
		lowerLimit: number;
	};
	index?: Array<{
		symbol: CurrencyKey;
		name: string;
		units: number;
		weight: number;
	}>;
};

export type SynthDefinitionMap = Record<string, SynthDefinition>;

type ContractSettings = {
	networkId: NetworkId;
	provider?: ethers.providers.Provider;
	signer?: Signer;
};

type SnxJS = {
	initialized: boolean;
	snxJS: ReturnType<typeof initSnxJS> | null;
	setContractSettings: (contractSettings: ContractSettings) => void;
	synthsMap: SynthDefinitionMap | null;
	synthSummaryUtil: ethers.Contract | null;
};

const snxContracts: SnxJS = {
	initialized: false,
	snxJS: null,
	synthSummaryUtil: null,
	synthsMap: null,

	setContractSettings({ networkId, provider, signer }: ContractSettings) {
		this.initialized = true;
		this.snxJS = initSnxJS({ networkId, provider, signer });
		this.synthsMap = keyBy(snxContracts.snxJS?.synths, 'name') as SynthDefinitionMap;
		this.synthSummaryUtil = new ethers.Contract(
			synthSummaryUtilContract.addresses[networkId],
			synthSummaryUtilContract.abi,
			provider
		);
	},
};

export default snxContracts;

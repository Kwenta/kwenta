import initSynthetixJS, { NetworkId } from '@synthetixio/js';
import { ethers, Signer } from 'ethers';

import synthSummaryUtilContract from './contracts/synthSummaryUtilContract';
import keyBy from 'lodash/keyBy';

export type Token = {
	address: string;
	asset?: string;
	decimals: number;
	feed?: string;
	index?: Array<{
		asset: string;
		category: string;
		description: string;
		sign: string;
		units: number;
		weight: number;
	}>;
	inverted?: {
		entryPoint: number;
		lowerLimit: number;
		upperLimit: number;
	};
	name: string;
	symbol: string;
};

export type Feed = {
	asset: string;
	category: string;
	desc?: string;
	description?: string;
	exchange?: string;
	feed?: string;
	sign: string;
};

export type Synth = {
	name: string;
	asset: string;
	category: string;
	sign: string;
	desc: string;
	aggregator?: string;
	subclass?: string;
};

export type Synths = Synth[];

export type SynthsMap = Record<string, Synth>;

export type TokensMap = Record<string, Token>;

type ContractSettings = {
	networkId: NetworkId;
	provider?: ethers.providers.Provider;
	signer?: Signer;
};

type Synthetix = {
	js: ReturnType<typeof initSynthetixJS> | null;
	setContractSettings: (contractSettings: ContractSettings) => void;
	synthsMap: SynthsMap | null;
	tokensMap: TokensMap | null;
	synthSummaryUtil: ethers.Contract | null;
};

const synthetix: Synthetix = {
	js: null,
	synthSummaryUtil: null,
	synthsMap: null,
	tokensMap: null,

	setContractSettings({ networkId, provider, signer }: ContractSettings) {
		this.js = initSynthetixJS({ networkId, provider, signer });
		console.log(this.js);
		this.synthsMap = keyBy(this.js.synths, 'name');
		this.tokensMap = keyBy(this.js.tokens, 'symbol');

		this.synthSummaryUtil = new ethers.Contract(
			synthSummaryUtilContract.addresses[networkId],
			synthSummaryUtilContract.abi,
			provider
		);
	},
};

export default synthetix;

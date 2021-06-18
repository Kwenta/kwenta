import initSynthetixJS, { NetworkId, Network } from '@synthetixio/contracts-interface';
import { ethers, Signer } from 'ethers';

import keyBy from 'lodash/keyBy';
import invert from 'lodash/invert';
import { CurrencyKey } from 'constants/currency';

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
	description?: string;
	exchange?: string;
	feed?: string;
	sign: string;
};

export type Synth = {
	name: CurrencyKey;
	asset: string;
	category: string;
	sign: string;
	description: string;
	aggregator?: string;
	subclass?: string;
	inverted?: {
		entryPoint: number;
		lowerLimit: number;
		upperLimit: number;
	};
};

export type Synths = Synth[];

export type SynthsMap = Partial<Record<CurrencyKey, Synth>>;

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
	chainIdToNetwork: Record<NetworkId, Network> | null;
};

const HIDDEN_SYNTHS: CurrencyKey[] = [];

const synthetix: Synthetix = {
	js: null,
	synthsMap: null,
	tokensMap: null,
	chainIdToNetwork: null,

	setContractSettings({ networkId, provider, signer }: ContractSettings) {
		this.js = initSynthetixJS({ networkId, provider, signer });
		if (HIDDEN_SYNTHS.length) {
			this.js.synths = this.js.synths.filter((synth) => !HIDDEN_SYNTHS.includes(synth.name as CurrencyKey));
		}

		this.synthsMap = keyBy(this.js.synths, 'name');
		this.tokensMap = keyBy(this.js.tokens, 'symbol');

		// @ts-ignore
		this.chainIdToNetwork = invert(this.js.networkToChainId);
	},
};

export default synthetix;

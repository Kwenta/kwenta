import { atom } from 'recoil';

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
	isFrozen?: boolean;
};

export type SynthDefinitionMap = Record<string, SynthDefinition>;

const getKey = (subKey: string) => `synths/${subKey}`;

export const synthsMapState = atom<SynthDefinitionMap | null>({
	key: getKey('synthsMap'),
	default: null,
});

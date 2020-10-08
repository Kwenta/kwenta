export enum SynthSort {
	Price,
	Rates24HLow,
	Rates24HHigh,
	Volume,
	Change,
}

export const SYNTH_SORT_OPTIONS = [
	{ label: 'dashboard.synth-sort.24h-vol', value: SynthSort.Volume },
	{ label: 'dashboard.synth-sort.24h-high', value: SynthSort.Rates24HHigh },
	{ label: 'dashboard.synth-sort.24h-low', value: SynthSort.Rates24HLow },
	{ label: 'dashboard.synth-sort.24h-change', value: SynthSort.Change },
	{ label: 'dashboard.synth-sort.price', value: SynthSort.Price },
];

export const DEFAULT_SORT_OPTION = {
	label: 'dashboard.synth-sort.24h-vol',
	value: SynthSort.Volume,
};

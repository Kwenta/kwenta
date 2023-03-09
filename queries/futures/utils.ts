import { wei } from '@synthetixio/wei';

import { SynthsTrades, SynthsVolumes } from 'queries/synths/type';

export const calculateTradeVolumeForAllSynths = (SynthTrades: SynthsTrades): SynthsVolumes => {
	const synthVolumes: SynthsVolumes = {};
	const result = SynthTrades.synthExchanges
		.filter((i) => i.fromSynth !== null)
		.reduce((acc, curr) => {
			if (curr.fromSynth?.symbol) {
				acc[curr.fromSynth.symbol] = acc[curr.fromSynth.symbol]
					? wei(acc[curr.fromSynth.symbol]).add(curr.fromAmountInUSD)
					: wei(curr.fromAmountInUSD);
			}
			return acc;
		}, synthVolumes);
	return result;
};

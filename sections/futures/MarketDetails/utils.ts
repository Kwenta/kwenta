import { Synths } from 'constants/currency';

const markets = [Synths.sETH, Synths.sBTC, Synths.sLINK] as const;

const map: Record<typeof markets[number], string> = {
	[Synths.sETH]: 'ethereum',
	[Synths.sBTC]: 'bitcoin',
	[Synths.sLINK]: 'chainlink',
};

export const synthToCoingeckoPriceId = (synth: any) => {
	if (markets.includes(synth)) {
		return map[synth as typeof markets[number]];
	} else {
		return 'ethereum';
	}
};

export function findTimeDiff(numSecs: any) {
	const minDiff = Math.abs(numSecs) / (1000 * 60),
		minFloor = Math.floor(minDiff),
		secDiff = (minDiff - minFloor) * 60,
		secFloor = Math.floor(secDiff)

	const min = minFloor.toString().padStart(2, '0'),
		sec = secFloor.toString().padStart(2, '0')

	return `${ min }:${ sec } mm:ss`
};

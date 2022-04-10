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

export function findDateTimeDiff(date1: any, date2: any) {
	const dayDiff = Math.abs(date2 - date1) / (1000 * 60 * 60 * 24),
	  dayFloor = Math.floor(dayDiff),
	  hourDiff = (dayDiff - dayFloor) * 24,
	  hourFloor = Math.floor(hourDiff),
	  minDiff = (hourDiff - hourFloor) * 60,
	  minFloor = Math.floor(minDiff),
	  secDiff = (minDiff - minFloor) * 60,
	  secFloor = Math.floor(minDiff)
  
	let dayResult: string = '',
	  hourResult: string = ''
  
	if (dayFloor.toString() !== '0') dayResult = `${ dayFloor.toString() } days, `
	if (hourFloor.toString() !== '0') hourResult = `${ hourFloor.toString() } hrs, `
  
	let minResult = `${ minFloor.toString() } min`,
		secResult = `${ secFloor.toString() } sec`

  
	const dateTimeDiff = `${ minResult }${ secResult }`
  
	return dateTimeDiff
};

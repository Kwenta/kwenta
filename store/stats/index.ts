import { atom, selector } from 'recoil';

import { StatsTimeframe } from 'hooks/useStatsData';
import { getStatsKey } from 'store/utils';

export const selectedTimeframeState = atom<StatsTimeframe>({
	key: getStatsKey('selectedTimeframe'),
	default: '1M',
});

export const minTimestampState = selector({
	key: getStatsKey('minTimestamp'),
	get: ({ get }) => {
		const selectedTimeframe = get(selectedTimeframeState);
		if (selectedTimeframe === 'MAX') return 0;

		const timeframeSeconds =
			selectedTimeframe === '1M'
				? 60 * 60 * 24 * 30
				: selectedTimeframe === '1Y'
				? 60 * 60 * 24 * 365
				: 0;
		const currentTimestamp = new Date().getTime() / 1000;
		return Math.floor(currentTimestamp - timeframeSeconds);
	},
});

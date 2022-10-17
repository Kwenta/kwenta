import { atom } from 'recoil';

import { StatsTimeframe } from 'hooks/useStatsData';
import { getStatsKey } from 'store/utils';

export const selectedTimeframeState = atom<StatsTimeframe>({
	key: getStatsKey('currentMarket'),
	default: '1M',
});

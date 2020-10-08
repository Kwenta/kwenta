import { atom } from 'recoil';

import { DEFAULT_SORT_OPTION } from 'sections/dashboard/TrendingSynths/constants';

const getKey = (subKey: string) => `ui/${subKey}`;

export const hasOrdersNotificationState = atom<boolean>({
	key: getKey('hasOrderNotifications'),
	default: false,
});

export const trendingSynthsOptionState = atom<typeof DEFAULT_SORT_OPTION>({
	key: getKey('trendingSynthsOption'),
	default: DEFAULT_SORT_OPTION,
});

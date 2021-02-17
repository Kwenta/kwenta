import { atom } from 'recoil';

import { DEFAULT_SORT_OPTION } from 'sections/dashboard/TrendingSynths/constants';
import { SHORT_C_RATIO } from 'sections/shorting/ShortingCard/components/CRatioSelector/CRatioSelector';

import { getUIKey } from '../utils';

export const hasOrdersNotificationState = atom<boolean>({
	key: getUIKey('hasOrderNotifications'),
	default: false,
});

export const trendingSynthsOptionState = atom<typeof DEFAULT_SORT_OPTION>({
	key: getUIKey('trendingSynthsOption'),
	default: DEFAULT_SORT_OPTION,
});

export const shortCRatioState = atom<number>({
	key: getUIKey('shortCRatio'),
	default: SHORT_C_RATIO.safe,
});

export const customShortCRatioState = atom<string>({
	key: getUIKey('customShortCRatio'),
	default: '',
});

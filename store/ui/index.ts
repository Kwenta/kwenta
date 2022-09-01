import { atom } from 'recoil';

import { DEFAULT_SLIPPAGE } from 'constants/defaults';
import { localStorageEffect } from 'store/effects';
import { ThemeName } from 'styles/theme';

import { getUIKey } from '../utils';

export const hasOrdersNotificationState = atom<boolean>({
	key: getUIKey('hasOrderNotifications'),
	default: false,
});

export const slippageState = atom<number>({
	key: getUIKey('slippage'),
	default: DEFAULT_SLIPPAGE,
});

export const currentThemeState = atom<ThemeName>({
	key: getUIKey('currentTheme'),
	default: 'dark',
	effects: [localStorageEffect('currentTheme')],
});

export const isCompetitionActive = atom<boolean>({
	key: getUIKey('isCompetitionActive'),
	default: process.env.NEXT_PUBLIC_COMPETITION_ACTIVE === 'true',
});

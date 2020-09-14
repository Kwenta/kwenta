import { atom } from 'recoil';

const getKey = (subKey: string) => `ui/${subKey}`;

export const hasOrdersNotificationState = atom<boolean>({
	key: getKey('hasOrderNotifications'),
	default: false,
});

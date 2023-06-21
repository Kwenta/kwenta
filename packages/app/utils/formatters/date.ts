import differenceInSeconds from 'date-fns/differenceInSeconds';
import format from 'date-fns/format';
import { TFunction } from 'i18next';

import getLocale from './getLocale';

export const timePresentation = (timestamp: string, t: TFunction) => {
	const actionTime = new Date(Number(timestamp) * 1000);
	const seconds = differenceInSeconds(new Date(), actionTime);
	if (seconds < 60) {
		return t('common.time.n-sec-ago', { timeDelta: seconds });
	}

	if (seconds < 3600) {
		return t('common.time.n-min-ago', {
			timeDelta: Math.floor(seconds / 60),
		});
	}

	if (seconds < 86400) {
		return t('common.time.n-hr-ago', {
			timeDelta: Math.floor(seconds / 3600),
		});
	}

	if (seconds < 604800) {
		return t('common.time.n-day-ago', {
			timeDelta: Math.floor(seconds / 86400),
		});
	}

	if (seconds < 2419200) {
		return t('common.time.n-week-ago', {
			timeDelta: Math.floor(seconds / 604800),
		});
	}
	return format(actionTime, getLocale().formatLong?.date({ width: 'short' }) ?? 'MM/dd/yyyy');
};

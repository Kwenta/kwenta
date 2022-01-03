import formatDate from 'date-fns/format';
import getISOWeeksInYear from 'date-fns/getISOWeeksInYear';
import subHours from 'date-fns/subHours';

import { strPadLeft } from './string';

export const formatTxTimestamp = (timestamp: number | Date) =>
	formatDate(timestamp, 'MMM d, yy | HH:mm');

export const toJSTimestamp = (timestamp: number) => timestamp * 1000;

export const formatShortDate = (date: Date | number) => formatDate(date, 'MMM d, yyyy');

export const formatShortDateWithTime = (date: Date | number) =>
	formatDate(date, 'MMM d, yyyy H:mma');
export const formatDateWithTime = (date: Date | number) => formatDate(date, 'd MMM yyyy H:mm');

export const secondsToTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = seconds - minutes * 60;

	return `${strPadLeft(minutes, '0', 2)}:${strPadLeft(secondsLeft, '0', 2)}`;
};

export const WEEKS_IN_YEAR = getISOWeeksInYear(new Date());

export const calculateTimestampForPeriod = (periodInHours: number) =>
	Math.trunc(subHours(new Date().getTime(), periodInHours).getTime());

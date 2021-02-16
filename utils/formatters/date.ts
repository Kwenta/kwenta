import format from 'date-fns/format';

import { strPadLeft } from './string';

export const formatTxTimestamp = (timestamp: number | Date) =>
	format(timestamp, 'MMM d, yy | HH:mm');

export const toJSTimestamp = (timestamp: number) => timestamp * 1000;

export const formatShortDate = (date: Date | number) => format(date, 'MMM d, yyyy');

export const formatShortDateWithTime = (date: Date | number) => format(date, 'MMM d, yyyy H:mma');
export const formatDateWithTime = (date: Date | number) => format(date, 'MM-dd-yy H:mma');

export const secondsToTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = seconds - minutes * 60;

	return `${strPadLeft(minutes, '0', 2)}:${strPadLeft(secondsLeft, '0', 2)}`;
};

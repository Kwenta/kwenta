import format from 'date-fns/format';

export const formatTxTimestamp = (timestamp: number | Date) =>
	format(timestamp, 'MMM d, yy | HH:mm');

export const toJSTimestamp = (timestamp: number) => timestamp * 1000;

export const formatShortDate = (date: Date | number) => format(date, 'MMM d, yyyy');

export const formatShortDateWithTime = (date: Date | number) => format(date, 'MMM d, yyyy H:mma');

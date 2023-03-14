export enum Period {
	ONE_HOUR = 'ONE_HOUR',
	FOUR_HOURS = 'FOUR_HOURS',
	ONE_DAY = 'ONE_DAY',
	ONE_WEEK = 'ONE_WEEK',
	ONE_MONTH = 'ONE_MONTH',
	ONE_YEAR = 'ONE_YEAR',
}

export const PERIOD_DISPLAY: Record<Period, string> = {
	ONE_HOUR: '1H',
	FOUR_HOURS: '4H',
	ONE_DAY: '1D',
	ONE_WEEK: '1W',
	ONE_MONTH: '1M',
	ONE_YEAR: '1Y',
};

export const PERIOD_IN_HOURS: Record<Period, number> = {
	ONE_HOUR: 1,
	FOUR_HOURS: 4,
	ONE_DAY: 24,
	ONE_MONTH: 672,
	ONE_WEEK: 168,
	ONE_YEAR: 8766,
};

export const PERIOD_IN_SECONDS: Record<Period, number> = {
	ONE_HOUR: 60 * 60,
	FOUR_HOURS: 4 * 60 * 60,
	ONE_DAY: 24 * 60 * 60,
	ONE_MONTH: 672 * 60 * 60,
	ONE_WEEK: 168 * 60 * 60,
	ONE_YEAR: 8766 * 60 * 60,
};

export const SECONDS_PER_DAY = 24 * 60 * 60;

export const MILLISECONDS_PER_DAY = SECONDS_PER_DAY * 1000;

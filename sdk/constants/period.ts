export enum Period {
	ONE_HOUR = 'ONE_HOUR',
	FOUR_HOURS = 'FOUR_HOURS',
	ONE_DAY = 'ONE_DAY',
	ONE_WEEK = 'ONE_WEEK',
	ONE_MONTH = 'ONE_MONTH',
}

export const PERIOD_IN_HOURS: Record<Period, number> = {
	ONE_HOUR: 1,
	FOUR_HOURS: 4,
	ONE_DAY: 24,
	ONE_MONTH: 672,
	ONE_WEEK: 168,
};

export const PERIOD_IN_SECONDS: Record<Period, number> = {
	ONE_HOUR: 60 * 60,
	FOUR_HOURS: 4 * 60 * 60,
	ONE_DAY: 24 * 60 * 60,
	ONE_MONTH: 672 * 60 * 60,
	ONE_WEEK: 168 * 60 * 60,
};

export const SECONDS_PER_DAY = 24 * 60 * 60;

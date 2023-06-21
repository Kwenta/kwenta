import { FIAT_SYNTHS } from '@kwenta/sdk/constants';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import moment from 'moment-business-time';

import {
	AFTER_HOURS_SYNTHS,
	COMMODITY_SYNTHS,
	CurrencyKey,
	LSE_SYNTHS,
	TSE_SYNTHS,
} from 'constants/currency';

export const forexHours = () => {
	// Sunday 5pm ET to Friday 4pm ET
	// This library's support for 24 hour markets is lacking as you'll see below. But this is still a better solution than calculating market hour diffs by hand.
	moment.locale('forex', {
		workinghours: {
			0: ['17:00:00', '126:00:00'], // Closing time is (24 * days until close inclusive) - 7
			1: ['00:00:00', '112:00:00'], // ie. On Monday it will be 112 hours until market close (4pm Friday)
			2: ['00:00:00', '88:00:00'],
			3: ['00:00:00', '64:00:00'],
			4: ['00:00:00', '40:00:00'],
			5: ['00:00:00', '16:00:00'],
			6: null,
		},
	});

	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const currentTimeInET = utcToZonedTime(
		zonedTimeToUtc(new Date(), currentTimezone),
		'America/New_York'
	);

	const nextOpenET = moment(currentTimeInET).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenET, 'America/New_York');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);

	const nextTransitionET = moment(currentTimeInET).nextTransitionTime().moment.toDate();
	const nextTransitionUTC = zonedTimeToUtc(nextTransitionET, 'America/New_York');
	const nextTransitionLocal = utcToZonedTime(nextTransitionUTC, currentTimezone);

	return {
		nextOpen: nextOpenLocal,
		nextTransition: nextTransitionLocal,
		isWorkingTime: moment(currentTimeInET).isWorkingTime(),
	};
};

export const usHours = () => {
	moment.locale('en', {
		workinghours: {
			0: null,
			1: ['09:30:00', '16:00:00'],
			2: ['09:30:00', '16:00:00'],
			3: ['09:30:00', '16:00:00'],
			4: ['09:30:00', '16:00:00'],
			5: ['09:30:00', '16:00:00'],
			6: null,
		},
		holidays: [
			// Recurring
			'*-01-01',
			'*-07-04',
			'*-12-25',
			// 2021
			'2021-01-18',
			'2021-02-15',
			'2021-04-02',
			'2021-05-31',
			'2021-07-05',
			'2021-09-06',
			'2021-11-25',
			'2021-12-24',
			// 2022
			'2021-01-17',
			'2021-02-21',
			'2021-04-15',
			'2021-05-30',
			'2021-09-05',
			'2021-11-24',
			'2021-12-26',
			// 2023
			'2021-01-02',
			'2021-01-16',
			'2021-02-20',
			'2021-04-07',
			'2021-05-29',
			'2021-09-04',
			'2021-11-23',
		],
	});

	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const currentTimeInET = utcToZonedTime(
		zonedTimeToUtc(new Date(), currentTimezone),
		'America/New_York'
	);

	const nextOpenET = moment(currentTimeInET).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenET, 'America/New_York');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);

	const nextTransitionET = moment(currentTimeInET).nextTransitionTime().moment.toDate();
	const nextTransitionUTC = zonedTimeToUtc(nextTransitionET, 'America/New_York');
	const nextTransitionLocal = utcToZonedTime(nextTransitionUTC, currentTimezone);

	return {
		nextOpen: nextOpenLocal,
		nextTransition: nextTransitionLocal,
		isWorkingTime: moment(currentTimeInET).isWorkingTime(),
	};
};

export const lseHours = () => {
	moment.locale('gb', {
		workinghours: {
			0: null,
			1: ['08:00:00', '12:00:00', '12:02:00', '16:30:00'],
			2: ['08:00:00', '12:00:00', '12:02:00', '16:30:00'],
			3: ['08:00:00', '12:00:00', '12:02:00', '16:30:00'],
			4: ['08:00:00', '12:00:00', '12:02:00', '16:30:00'],
			5: ['08:00:00', '12:00:00', '12:02:00', '16:30:00'],
			6: null,
		},
		holidays: [
			// Recurring
			'*-01-01',
			// 2021
			'2021-04-02',
			'2021-04-05',
			'2021-05-03',
			'2021-05-31',
			'2021-08-30',
			'2021-12-27',
			'2021-12-28',
			// 2022
			'2021-01-03',
			'2021-04-15',
			'2021-04-18',
			'2021-05-02',
			'2021-05-30',
			'2021-08-29',
			'2021-12-26',
			'2021-12-27',
			// 2023
			'2021-01-02',
			'2021-04-07',
			'2021-04-10',
			'2021-05-01',
			'2021-05-29',
			'2021-08-28',
			'2021-12-25',
			'2021-12-26',
		],
	});

	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const currentTimeInBT = utcToZonedTime(
		zonedTimeToUtc(new Date(), currentTimezone),
		'Europe/London'
	);

	const nextOpenBT = moment(currentTimeInBT).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenBT, 'Europe/London');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);

	const nextTransitionBT = moment(currentTimeInBT).nextTransitionTime().moment.toDate();
	const nextTransitionUTC = zonedTimeToUtc(nextTransitionBT, 'Europe/London');
	const nextTransitionLocal = utcToZonedTime(nextTransitionUTC, currentTimezone);

	return {
		nextOpen: nextOpenLocal,
		nextTransition: nextTransitionLocal,
		isWorkingTime: moment(currentTimeInBT).isWorkingTime(),
	};
};

export const tseHours = () => {
	moment.locale('jp', {
		workinghours: {
			0: null,
			1: ['09:00:00', '11:30:00', '12:30:00', '15:00:00'],
			2: ['09:00:00', '11:30:00', '12:30:00', '15:00:00'],
			3: ['09:00:00', '11:30:00', '12:30:00', '15:00:00'],
			4: ['09:00:00', '11:30:00', '12:30:00', '15:00:00'],
			5: ['09:00:00', '11:30:00', '12:30:00', '15:00:00'],
			6: null,
		},
		holidays: [
			// Recurring
			'*-01-01',
			// 2021
			'2021-01-01',
			'2021-01-02',
			'2021-01-03',
			'2021-01-11',
			'2021-02-11',
			'2021-02-23',
			'2021-03-20',
			'2021-04-29',
			'2021-05-03',
			'2021-05-04',
			'2021-05-05',
			'2021-07-22',
			'2021-07-23',
			'2021-08-08',
			'2021-08-09',
			'2021-09-20',
			'2021-09-23',
			'2021-11-03',
			'2021-11-23',
			'2021-12-31',
			// 2022
			'2022-01-01',
			'2022-01-11',
			'2022-02-11',
			'2022-02-23',
			'2022-04-29',
			'2022-05-03',
			'2022-05-04',
			'2022-05-05',
			'2022-07-22',
			'2022-07-23',
			'2022-08-09',
			'2022-09-20',
			'2022-09-23',
			'2022-11-03',
			'2022-11-23',
			'2022-12-31',
		],
	});

	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const currentTimeInJST = utcToZonedTime(
		zonedTimeToUtc(new Date(), currentTimezone),
		'Asia/Tokyo'
	);

	const nextOpenJST = moment(currentTimeInJST).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenJST, 'Asia/Tokyo');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);

	const nextTransitionJST = moment(currentTimeInJST).nextTransitionTime().moment.toDate();
	const nextTransitionUTC = zonedTimeToUtc(nextTransitionJST, 'Asia/Tokyo');
	const nextTransitionLocal = utcToZonedTime(nextTransitionUTC, currentTimezone);

	return {
		nextOpen: nextOpenLocal,
		nextTransition: nextTransitionLocal,
		isWorkingTime: moment(currentTimeInJST).isWorkingTime(),
	};
};

export const marketNextOpen = (currencyKey: CurrencyKey) => {
	if (AFTER_HOURS_SYNTHS.has(currencyKey)) {
		return usHours().nextOpen;
	} else if (LSE_SYNTHS.has(currencyKey)) {
		return lseHours().nextOpen;
	} else if (TSE_SYNTHS.has(currencyKey)) {
		return tseHours().nextOpen;
	} else if (FIAT_SYNTHS.has(currencyKey)) {
		return forexHours().nextOpen;
	} else if (COMMODITY_SYNTHS.has(currencyKey)) {
		return forexHours().nextOpen;
	} else {
		return null;
	}
};

export const marketNextTransition = (currencyKey: CurrencyKey) => {
	if (AFTER_HOURS_SYNTHS.has(currencyKey)) {
		return usHours().nextTransition;
	} else if (LSE_SYNTHS.has(currencyKey)) {
		return lseHours().nextTransition;
	} else if (TSE_SYNTHS.has(currencyKey)) {
		return tseHours().nextTransition;
	} else if (FIAT_SYNTHS.has(currencyKey)) {
		return forexHours().nextTransition;
	} else if (COMMODITY_SYNTHS.has(currencyKey)) {
		return forexHours().nextTransition;
	} else {
		return null;
	}
};

export const marketIsOpen = (currencyKey: CurrencyKey) => {
	if (AFTER_HOURS_SYNTHS.has(currencyKey)) {
		return usHours().isWorkingTime;
	} else if (LSE_SYNTHS.has(currencyKey)) {
		return lseHours().isWorkingTime;
	} else if (TSE_SYNTHS.has(currencyKey)) {
		return tseHours().isWorkingTime;
	} else if (FIAT_SYNTHS.has(currencyKey)) {
		return forexHours().isWorkingTime;
	} else if (COMMODITY_SYNTHS.has(currencyKey)) {
		return forexHours().isWorkingTime;
	} else {
		return null;
	}
};

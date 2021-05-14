import {
	AFTER_HOURS_SYNTHS,
	CurrencyKey,
	FIAT_SYNTHS,
	LSE_SYNTHS,
	TSE_SYNTHS,
} from 'constants/currency';
import { addHours, nextMonday, startOfDay, subDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import moment from 'moment-business-time';

export const forexNextOpen = () => {
	const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const currentTimeInAET = utcToZonedTime(
		zonedTimeToUtc(new Date(), currentTimezone),
		'Australia/Sydney'
	);
	const forexMarketOpenAET = addHours(startOfDay(nextMonday(subDays(currentTimeInAET, 1))), 9); //9am
	const forexMarketOpenUTC = zonedTimeToUtc(forexMarketOpenAET, 'Australia/Sydney');
	const forexMarketOpenLocal = utcToZonedTime(forexMarketOpenUTC, currentTimezone);
	return forexMarketOpenLocal;
};

export const usNextOpen = () => {
	moment.locale('en', {
		workinghours: {
			0: null,
			1: ['09:30:00', '4:00:00'],
			2: ['09:30:00', '4:00:00'],
			3: ['09:30:00', '4:00:00'],
			4: ['09:30:00', '4:00:00'],
			5: ['09:30:00', '4:00:00'],
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
	const nextOpenET = moment(new Date()).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenET, 'America/New_York');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);
	return nextOpenLocal;
};

export const lseNextOpen = () => {
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
	const nextOpenBT = moment(new Date()).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenBT, 'Europe/London');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);
	return nextOpenLocal;
};

export const tseNextOpen = () => {
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
	const nextOpenJST = moment(new Date()).nextWorkingTime().toDate();
	const nextOpenUTC = zonedTimeToUtc(nextOpenJST, 'Asia/Tokyo');
	const nextOpenLocal = utcToZonedTime(nextOpenUTC, currentTimezone);
	return nextOpenLocal;
};

const marketNextOpen = (currencyKey: CurrencyKey) => {
	if (AFTER_HOURS_SYNTHS.has(currencyKey)) {
		return usNextOpen();
	} else if (LSE_SYNTHS.has(currencyKey)) {
		return lseNextOpen();
	} else if (TSE_SYNTHS.has(currencyKey)) {
		return tseNextOpen();
	} else if (FIAT_SYNTHS.has(currencyKey)) {
		return forexNextOpen();
	} else {
		return null;
	}
};

export default marketNextOpen;

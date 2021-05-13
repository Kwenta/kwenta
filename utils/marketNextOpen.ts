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

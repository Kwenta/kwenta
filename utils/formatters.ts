import BigNumber from 'bignumber.js';
import format from 'date-fns/format';

import { CurrencyKey } from 'constants/currency';

type NumericValue = string | number;

export const toBigNumber = (value: BigNumber | NumericValue) => new BigNumber(value);

export const formatCryptoCurrency = (value: BigNumber | NumericValue) =>
	toBigNumber(value).toFormat(4);

export const truncateAddress = (address: string, first = 5, last = 5) =>
	`${address.slice(0, first)}...${address.slice(-last, address.length)}`;

export const formatTxTimestamp = (timestamp: number | Date) =>
	format(timestamp, 'MMM d, yy | HH:mm');

export const toJSTimestamp = (timestamp: number) => timestamp * 1000;

export const formatCurrencyPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
	`${baseCurrencyKey} / ${quoteCurrencyKey}`;

export const getDecimalPlaces = (value: NumericValue) =>
	(value.toString().split('.')[1] || '').length;

export const formatShortDate = (date: Date | number) => format(date, 'MMM d, yyyy');
export const formatShortDateWithTime = (date: Date | number) => format(date, 'MMM d, yyyy H:mma');

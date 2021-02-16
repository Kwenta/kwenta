import { CurrencyKey } from 'constants/currency';

export const truncateAddress = (address: string, first = 5, last = 5) =>
	`${address.slice(0, first)}...${address.slice(-last, address.length)}`;

export const formatCurrencyPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
	`${baseCurrencyKey} / ${quoteCurrencyKey}`;

export const strPadLeft = (string: string | number, pad: string, length: number) => {
	return (new Array(length + 1).join(pad) + string).slice(-length);
};

export const hexToAscii = (str: string): string => {
	const hex = str.toString();
	let out = '';
	for (let n = 2; n < hex.length; n += 2) {
		const nextPair = hex.substr(n, 2);
		if (nextPair !== '00') {
			out += String.fromCharCode(parseInt(nextPair, 16));
		}
	}
	return out;
};

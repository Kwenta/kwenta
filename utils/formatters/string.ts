import { CurrencyKey } from 'constants/currency';

export const truncateAddress = (address: string, first = 5, last = 5) =>
	`${address.slice(0, first)}...${address.slice(-last, address.length)}`;

export const truncateString = (text: string, max = 256) => {
	if (text?.length > max) return text.substring(0, max) + ' ...';
	return text;
};

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

export const hexToAsciiV2 = (S: string) => {
	// https://gist.github.com/gluk64/fdea559472d957f1138ed93bcbc6f78a#file-reason-js
	const hex = S.substr(147).toString();
	let str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
};

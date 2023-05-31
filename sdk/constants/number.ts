import { wei } from '@synthetixio/wei';
import BN from 'bn.js';
import { BigNumber } from 'ethers';

import { CurrencyKey } from 'sdk/types/common';

export const ZERO_WEI = wei(0);

export const UNIT_BN = new BN('10').pow(new BN(18));
export const UNIT_BIG_NUM = BigNumber.from('10').pow(18);
export const ZERO_BIG_NUM = BigNumber.from('0');

export const DEFAULT_CRYPTO_DECIMALS = 4;
export const DEFAULT_FIAT_DECIMALS = 2;
export const DEFAULT_NUMBER_DECIMALS = 2;
export const DEFAULT_PERCENT_DECIMALS = 2;
export const DEFAULT_TOKEN_DECIMALS = 18;

export type FUTURES_FIAT = 'EUR' | 'JPY' | 'USD' | 'AUD' | 'GBP' | 'CHF';

export const FIAT_SYNTHS: Set<CurrencyKey | FUTURES_FIAT> = new Set([
	'sEUR',
	'sJPY',
	'sUSD',
	'sAUD',
	'sGBP',
	'sCHF',
	'EUR',
	'JPY',
	'USD',
	'AUD',
	'GBP',
	'CHF',
]);

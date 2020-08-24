import { FIAT_CURRENCY_MAP } from './currency';
import { Languages } from 'translations/constants';
import { NetworkId } from './network';

// app defaults
export const DEFAULT_LANGUAGE = Languages.EN;
export const DEFAULT_FIAT_CURRENCY = FIAT_CURRENCY_MAP.USD;

// network defaults
export const DEFAULT_NETWORK_ID: NetworkId = 1;
export const DEFAULT_GAS_LIMIT = 500000;

// ui defaults
export const DEFAULT_SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_REQUEST_REFRESH_INTERVAL = 30000; // 30s
export const DEFAULT_CRYPTO_DECIMALS = 4;
export const DEFAULT_FIAT_DECIMALS = 2;

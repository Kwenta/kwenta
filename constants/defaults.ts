import { Languages } from 'translations/constants';

import { SYNTHS_MAP } from './currency';
import { NetworkId } from '@synthetixio/js';

// app defaults
export const DEFAULT_LANGUAGE = Languages.EN;

// exchange defaults
export const DEFAULT_BASE_SYNTH = SYNTHS_MAP.sETH;
export const DEFAULT_QUOTE_SYNTH = SYNTHS_MAP.sBTC;

// network defaults
export const DEFAULT_NETWORK_ID = NetworkId.Mainnet;

export const DEFAULT_GAS_LIMIT = 500000;
export const DEFAULT_GAS_BUFFER = 5000;

// ui defaults
export const DEFAULT_SEARCH_DEBOUNCE_MS = 300;
export const DEFAULT_REQUEST_REFRESH_INTERVAL = 30000; // 30s
export const DEFAULT_CRYPTO_DECIMALS = 4;
export const DEFAULT_FIAT_DECIMALS = 2;
export const DEFAULT_NUMBER_DECIMALS = 2;
export const DEFAULT_PERCENT_DECIMALS = 2;

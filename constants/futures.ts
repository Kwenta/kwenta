import { wei } from '@synthetixio/wei';

import { CrossMarginOrderType, FuturesOrderType } from 'sdk/types/futures';

export const ISOLATED_MARGIN_ORDER_TYPES: FuturesOrderType[] = ['delayed_offchain', 'market'];
export const CROSS_MARGIN_ORDER_TYPES: CrossMarginOrderType[] = ['market', 'limit', 'stop_market'];
export const ORDER_KEEPER_ETH_DEPOSIT = wei(0.01);
export const DEFAULT_MAX_LEVERAGE = wei(10);
export const DEFAULT_DELAYED_LEVERAGE_CAP = wei(100);
export const MAX_POSITION_BUFFER = 0.01;
export const MIN_MARGIN_AMOUNT = wei(50);
export const APP_MAX_LEVERAGE = wei(25);

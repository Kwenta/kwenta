import { wei } from '@synthetixio/wei';

export const ISOLATED_MARGIN_ORDER_TYPES = ['market', 'next-price'];
export const CROSS_MARGIN_ORDER_TYPES = ['market', 'limit', 'stop'];
export const ORDER_KEEPER_ETH_DEPOSIT = wei(0.1);
export const DEFAULT_MAX_LEVERAGE = wei(10);
export const MAX_POSITION_BUFFER = 0.01;

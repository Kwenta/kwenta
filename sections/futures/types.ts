export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

export enum TradeStatus {
	LIQUIDATED = 'liquidated',
	OPEN = 'Open',
	CLOSED = 'Closed',
}

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/interfaces/IFuturesMarketBaseTypes.sol#L6-L19
export enum PotentialTradeStatus {
	OK = 0,
	INVALID_PRICE = 1,
	PRICE_OUT_OF_BOUNDS = 2,
	CAN_LIQUIDATE = 3,
	CANNOT_LIQUIDATE = 4,
	MAX_MARKET_SIZE_EXCEEDED = 5,
	MAX_LEVERAGE_EXCEEDED = 6,
	INSUFFICIENT_MARGIN = 7,
	NOT_PERMITTED = 8,
	NIL_ORDER = 9,
	NO_POSITION_OPEN = 10,
	PRICE_TOO_VOLATILE = 11,
}

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/PerpsV2MarketBase.sol#L130-L141
export const POTENTIAL_TRADE_STATUS_TO_MESSAGE: { [key: string]: string } = {
	INVALID_PRICE: 'Invalid price',
	PRICE_OUT_OF_BOUNDS: 'Price out of acceptable range',
	CAN_LIQUIDATE: 'Position can be liquidated',
	CANNOT_LIQUIDATE: 'Position cannot be liquidated',
	MAX_MARKET_SIZE_EXCEEDED: 'Max market size exceeded',
	MAX_LEVERAGE_EXCEEDED: 'Max leverage exceeded',
	INSUFFICIENT_MARGIN: 'Insufficient margin',
	NOT_PERMITTED: 'Not permitted by this address',
	NIL_ORDER: 'Cannot submit empty order',
	NO_POSITION_OPEN: 'No position open',
	PRICE_TOO_VOLATILE: 'Price too volatile',
};

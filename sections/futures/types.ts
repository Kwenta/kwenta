import { CurrencyKey } from 'constants/currency';

export enum MarketState {
	OPEN = 'OPEN',
	CLOSED = 'CLOSED',
	PAUSED = 'PAUSED',
}

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

export enum OrderStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	FAILED = 'failed',
}

export enum TradeStatus {
	LIQUIDATED = 'liquidated',
	OPEN = 'Open',
	CLOSED = 'Closed',
}

export type Position = {
	position: {
		side: PositionSide;
		amount: number;
		currency: CurrencyKey;
	};
	price: number;
	liquidationPrice: number;
	margin: number;
	marginChange: number;
	riskOfLiquidation: boolean;
};

export type Order = {
	id: string;
	position: {
		side: PositionSide;
		amount: number;
		currency: CurrencyKey;
	};
	leverage: {
		amount: number;
		side: PositionSide;
	};
	status: OrderStatus;
	fee: number;
	txHash: string;
};

export type Trade = {
	id: string;
	position: {
		side: PositionSide;
		amount: number;
		currency: CurrencyKey;
	};
	leverage: {
		amount: number;
		side: PositionSide;
	};
	entryPrice: number;
	finalPrice: number;
	pnl: number;
	status: TradeStatus;
	txHash: string;
};

export type PotentialTrade = {
	size: string;
	side: PositionSide;
};

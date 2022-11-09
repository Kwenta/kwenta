import { Transaction } from 'ethers';

export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export type Order = {
	hash: string;
	baseCurrencyKey: string;
	baseCurrencyAmount: string;
	quoteCurrencyKey: string;
	quoteCurrencyAmount: string;
	orderType: 'market' | 'limit';
	status: OrderStatus;
	timestamp: number;
	transaction: Transaction | null;
};

export type OrderByStatus = {
	pending: Order[];
	confirmed: Order[];
	cancelled: Order[];
};

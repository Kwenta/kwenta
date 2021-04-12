import { atom, selector } from 'recoil';
import { CurrencyKey } from 'constants/currency';
import orderBy from 'lodash/orderBy';
import groupBy from 'lodash/groupBy';
import { Transaction } from 'ethers';

import { getOrdersKey } from '../utils';

export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export type Order = {
	hash: string;
	baseCurrencyKey: CurrencyKey;
	baseCurrencyAmount: string;
	quoteCurrencyKey: CurrencyKey;
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

// TOOD: fetch from local storage
export const ordersState = atom<Order[]>({
	key: getOrdersKey('orders'),
	default: [],
});

export const ordersByStatusState = selector<OrderByStatus>({
	key: getOrdersKey('ordersByStatus'),
	get: ({ get }) => {
		const orders = get(ordersState);

		const groupedOrders = groupBy(orderBy(orders, 'timestamp', 'desc'), 'status') as OrderByStatus;

		return {
			pending: groupedOrders.pending ?? [],
			confirmed: groupedOrders.confirmed ?? [],
			cancelled: groupedOrders.cancelled ?? [],
		};
	},
});

export const hasPendingOrderState = selector<boolean>({
	key: getOrdersKey('hasPendingOrder'),
	get: ({ get }) => {
		const ordersByStatus = get(ordersByStatusState);

		return ordersByStatus.pending.length > 0;
	},
});

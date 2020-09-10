import { Order } from 'store/orders';

export type OrderGroup = {
	id: string;
	title: string;
	data: Order[];
	noResults: string;
};

import React from 'react';
import BaseDrawer from './BaseDrawer';

type OrderDrawerProps = {
	open: boolean;
	closeDrawer(): void;
};

const OrderDrawer: React.FC<OrderDrawerProps> = ({ open, closeDrawer }) => {
	return <BaseDrawer open={open} closeDrawer={closeDrawer} items={[]} />;
};

export default OrderDrawer;

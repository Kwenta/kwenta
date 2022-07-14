import React from 'react';
import { SectionHeader } from '../common';
import OpenOrdersTable from 'sections/futures/UserInfo/OpenOrdersTable';

const OrdersTab: React.FC = () => {
	return (
		<div>
			<SectionHeader>Orders</SectionHeader>
			<OpenOrdersTable />
		</div>
	);
};

export default OrdersTab;

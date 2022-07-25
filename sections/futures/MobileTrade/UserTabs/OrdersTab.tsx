import React from 'react';

import OpenOrdersTable from 'sections/futures/UserInfo/OpenOrdersTable';

import { SectionHeader, SectionTitle } from '../common';

const OrdersTab: React.FC = () => {
	return (
		<div>
			<SectionHeader>
				<SectionTitle>Orders</SectionTitle>
			</SectionHeader>

			<OpenOrdersTable />
		</div>
	);
};

export default OrdersTab;

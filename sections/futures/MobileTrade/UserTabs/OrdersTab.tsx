import React from 'react';

import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import OpenOrdersTable from 'sections/futures/UserInfo/OpenOrdersTable';

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

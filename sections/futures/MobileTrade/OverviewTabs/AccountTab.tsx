import React from 'react';
import MarketActions from 'sections/futures/Trade/MarketActions';

import { Pane, SectionHeader, SectionTitle } from '../common';
import MarketInfoBox from 'sections/futures/MarketInfoBox';

const AccountTab: React.FC = () => (
	<Pane>
		<SectionHeader>
			<SectionTitle>Account</SectionTitle>
		</SectionHeader>

		<MarketInfoBox />

		<MarketActions />
	</Pane>
);

export default AccountTab;

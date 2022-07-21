import React from 'react';

import MarketInfoBox from 'sections/futures/MarketInfoBox';
import MarketActions from 'sections/futures/Trade/MarketActions';

import { Pane, SectionHeader, SectionTitle } from '../common';

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

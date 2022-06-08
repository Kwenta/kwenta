import React from 'react';
import MarketActions from 'sections/futures/Trade/MarketActions';

import { Pane, SectionHeader } from '../common';
import MarketInfoBox from 'sections/futures/MarketInfoBox';

const AccountTab: React.FC = () => (
	<Pane>
		<SectionHeader>Account</SectionHeader>

		<MarketInfoBox />

		<MarketActions />
	</Pane>
);

export default AccountTab;

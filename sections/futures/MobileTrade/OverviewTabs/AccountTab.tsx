import React from 'react';
import MarketActions from 'sections/futures/Trade/MarketActions';

import { Pane, SectionHeader } from '../common';
import MarketInfoBox from 'sections/futures/MarketInfoBox';

const AccountTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>Account</SectionHeader>

			<MarketInfoBox />

			<MarketActions openDepositModal={() => {}} openWithdrawModal={() => {}} />
		</Pane>
	);
};

export default AccountTab;

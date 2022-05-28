import React from 'react';
import MarketActions from 'sections/futures/Trade/MarketActions';

// import MarketInfoBox from 'sections/futures/MarketInfoBox';
import { Pane, SectionHeader } from '../common';

const AccountTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>Account</SectionHeader>
			<MarketActions
				marketClosed={false}
				openDepositModal={() => {}}
				openWithdrawModal={() => {}}
			/>
		</Pane>
	);
};

export default AccountTab;

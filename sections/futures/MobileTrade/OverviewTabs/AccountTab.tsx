import React from 'react';
import { useRecoilValue } from 'recoil';

import MarketInfoBox from 'sections/futures/MarketInfoBox';
import MarketActions from 'sections/futures/Trade/MarketActions';
import MarginInfoBox from 'sections/futures/TradeCrossMargin/MarginInfoBox';
import { futuresAccountTypeState } from 'store/futures';

import { Pane, SectionHeader, SectionTitle } from '../common';

const AccountTab: React.FC = () => {
	const accountType = useRecoilValue(futuresAccountTypeState);
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Account</SectionTitle>
			</SectionHeader>

			{accountType === 'isolated_margin' ? (
				<>
					<MarketInfoBox />
					<MarketActions />
				</>
			) : (
				<>
					<MarginInfoBox />
				</>
			)}
		</Pane>
	);
};

export default AccountTab;

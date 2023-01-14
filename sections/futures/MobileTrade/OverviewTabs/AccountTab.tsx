import React from 'react';

import { Pane, SectionHeader, SectionTitle } from 'components/mobile/futures';
import MarketInfoBox from 'sections/futures/MarketInfoBox';
import MarketActions from 'sections/futures/Trade/MarketActions';
import MarginInfoBox from 'sections/futures/TradeCrossMargin/CrossMarginInfoBox';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

const AccountTab: React.FC = () => {
	const accountType = useAppSelector(selectFuturesType);
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
				<MarginInfoBox />
			)}
		</Pane>
	);
};

export default AccountTab;

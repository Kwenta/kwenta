import React from 'react';
import MarketActions from 'sections/futures/Trade/MarketActions';

import { Pane, SectionHeader } from '../common';
import { useRecoilValue } from 'recoil';
import { currentMarketState } from 'store/futures';
import MarketInfoBox from 'sections/futures/MarketInfoBox';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';

const AccountTab: React.FC = () => {
	const marketAsset = useRecoilValue(currentMarketState);
	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketAsset);

	return (
		<Pane>
			<SectionHeader>Account</SectionHeader>

			<MarketInfoBox isMarketClosed={isFuturesMarketClosed} />

			<MarketActions
				marketClosed={false}
				openDepositModal={() => {}}
				openWithdrawModal={() => {}}
			/>
		</Pane>
	);
};

export default AccountTab;

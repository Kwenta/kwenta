import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { futuresAccountState, leverageSideState, orderTypeState } from 'store/futures';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import AccountTypeToggle from './AccountTypeToggle';
import CrossMarginAccountActions from './CrossMarginAccountActions';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';
import MarketsDropdown from './MarketsDropdown';
import NextPrice from './NextPrice';

const Trade: React.FC = () => {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const futuresAccount = useRecoilValue(futuresAccountState);

	return (
		<div>
			{
				//TODO: Remove dev check
				futuresAccount.crossMarginAvailable && <AccountTypeToggle />
			}

			<MarketsDropdown />

			{futuresAccount.selectedAccountType === 'isolated_margin' ? (
				<MarketActions />
			) : (
				<CrossMarginAccountActions />
			)}

			<MarketInfoBox />

			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
		</div>
	);
};

export default Trade;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

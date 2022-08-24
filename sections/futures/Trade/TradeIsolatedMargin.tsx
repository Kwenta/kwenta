import React from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { leverageSideState, orderTypeState } from 'store/futures';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';
import MarketsDropdown from './MarketsDropdown';
import NextPrice from './NextPrice';
import TradePanelHeader from './TradePanelHeader';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);

	return (
		<div>
			{!isMobile && <MarketsDropdown />}

			<TradePanelHeader accountType={'isolated_margin'} />

			{!isMobile && (
				<>
					<MarketActions />
					<MarketInfoBox />
				</>
			)}

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

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

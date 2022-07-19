import React, { useState } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import { leverageSideState, orderTypeState } from 'store/futures';

import LeverageInput from '../LeverageInput';
import TradeConfirmationModal from './TradeConfirmationModal';
import MarketsDropdown from './MarketsDropdown';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import FeeInfoBox from '../FeeInfoBox';
import NextPrice from './NextPrice';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';
import MarketInfoBox from '../MarketInfoBox';

const Trade: React.FC = () => {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [openModal, setOpenModal] = useState<'trade' | 'next-price' | null>(null);

	return (
		<div>
			<MarketsDropdown />

			<MarketActions />

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

			<ManagePosition
				openConfirmationModal={() => setOpenModal(orderType === 1 ? 'next-price' : 'trade')}
			/>

			<FeeInfoBox />

			{openModal === 'trade' && <TradeConfirmationModal onDismiss={() => setOpenModal(null)} />}

			{openModal === 'next-price' && (
				<NextPriceConfirmationModal onDismiss={() => setOpenModal(null)} />
			)}
		</div>
	);
};

export default Trade;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

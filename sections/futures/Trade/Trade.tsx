import React, { useState } from 'react';
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
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import TradeConfirmationModal from './TradeConfirmationModal';

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

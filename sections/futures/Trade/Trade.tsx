import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import { futuresAccountState, leverageSideState, orderTypeState } from 'store/futures';

import CrossMarginOnboard from '../CrossMarginOnboard';
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
	const [openModal, setOpenModal] = useState<'trade' | 'next-price' | 'onboard' | null>(null);

	const [accountState, setAccountState] = useRecoilState(futuresAccountState);

	const onCreatedAccount = () => {
		// TODO: handle complete
	};

	const onSelectCrossMargin = () => {
		accountState.crossMarginAddress
			? setAccountState({
					...accountState,
					selectedType: 'cross_margin',
					selectedFuturesAddress: accountState.crossMarginAddress,
			  })
			: setOpenModal('onboard');
	};

	return (
		<div>
			<CrossMarginOnboard
				isOpen={openModal === 'onboard'}
				onClose={() => setOpenModal(null)}
				onComplete={onCreatedAccount}
			/>

			{accountState.selectedType === 'cross_margin' ? (
				<LegacyFuturesButton
					onClick={() =>
						setAccountState({
							...accountState,
							selectedType: 'isolated_margin',
							selectedFuturesAddress: accountState.walletAddress,
						})
					}
				>
					← Switch to Legacy Futures
				</LegacyFuturesButton>
			) : (
				<SwitchAccountButton variant="primary" onClick={onSelectCrossMargin}>
					Switch to Cross Margin
				</SwitchAccountButton>
			)}

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

const SwitchAccountButton = styled(Button)`
	margin-bottom: 24px;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
	width: 100%;
`;

const LegacyFuturesButton = styled.div`
	cursor: pointer;
	margin-bottom: 24px;
`;

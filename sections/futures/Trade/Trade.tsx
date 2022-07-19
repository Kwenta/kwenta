import React, { useState } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import { futuresAccountState, leverageSideState, orderTypeState } from 'store/futures';

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
import { useFuturesContext } from 'contexts/FuturesContext';
import CrossMarginOnboard from '../CrossMarginOnboard';
import Button from 'components/Button';

const Trade: React.FC = () => {
	const {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		placeOrderTranslationKey,
		error,
		dynamicFee,
		isMarketCapReached,
		orderTxn,
	} = useFuturesContext();

	const [accountState, setAccountState] = useRecoilState(futuresAccountState);

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [openModal, setOpenModal] = useState<'trade' | 'next-price' | 'onboard' | null>(null);

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

			<OrderSizing
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={onLeverageChange}
			/>

			<LeverageInput onLeverageChange={onLeverageChange} />

			<ManagePosition
				translationKey={placeOrderTranslationKey}
				marketCapReached={isMarketCapReached}
				openConfirmationModal={() => setOpenModal(orderType === 1 ? 'next-price' : 'trade')}
				error={error}
				orderError={orderTxn.errorMessage}
			/>

			<FeeInfoBox dynamicFee={dynamicFee} />

			{openModal === 'trade' && (
				<TradeConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					onDismiss={() => setOpenModal(null)}
				/>
			)}

			{openModal === 'next-price' && (
				<NextPriceConfirmationModal
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					onDismiss={() => setOpenModal(null)}
				/>
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

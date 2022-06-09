import React, { useState } from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import useFuturesData from 'hooks/useFuturesData';

import LeverageInput from '../LeverageInput';
import TradeConfirmationModal from './TradeConfirmationModal';
import MarketsDropdown from './MarketsDropdown';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import NextPrice from './NextPrice';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import { leverageSideState, orderTypeState } from 'store/futures';
import ManagePosition from './ManagePosition';
import MarketActions from './MarketActions';

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
	} = useFuturesData();

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
			/>

			{(orderTxn.errorMessage || error) && (
				<ErrorMessage>{orderTxn.errorMessage || error}</ErrorMessage>
			)}

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

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	margin-bottom: 16px;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

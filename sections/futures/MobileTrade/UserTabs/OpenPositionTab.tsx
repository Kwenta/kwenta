import React from 'react';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';

import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from 'sections/futures/PositionButtons';
import OrderSizing from 'sections/futures/OrderSizing';
import LeverageInput from 'sections/futures/LeverageInput';

import { leverageSideState, orderTypeState } from 'store/futures';
import useFuturesData from 'hooks/useFuturesData';
import ManagePosition from 'sections/futures/Trade/ManagePosition';
import FeeInfoBox from 'sections/futures/FeeInfoBox';

const OpenPositionTab: React.FC = () => {
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);

	const {
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		onLeverageChange,
		maxLeverageValue,
		isFuturesMarketClosed,
		isMarketCapReached,
		shouldDisplayNextPriceDisclaimer,
		placeOrderTranslationKey,
		dynamicFee,
		error,
	} = useFuturesData();

	return (
		<div>
			<StyledSegmentedControl
				selectedIndex={orderType}
				values={['Market', 'Next-Price']}
				onChange={setOrderType}
			/>

			<PositionButtons selected={leverageSide} onSelect={setLeverageSide} isMarketClosed={false} />

			<OrderSizing
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={onLeverageChange}
				maxLeverage={maxLeverageValue}
			/>

			<LeverageInput
				maxLeverage={maxLeverageValue}
				onLeverageChange={onLeverageChange}
				isMarketClosed={isFuturesMarketClosed}
				isDisclaimerDisplayed={orderType === 1 && shouldDisplayNextPriceDisclaimer}
			/>

			<ManagePosition
				marketCapReached={isMarketCapReached}
				maxLeverageValue={maxLeverageValue}
				translationKey={placeOrderTranslationKey}
				openConfirmationModal={() => {}}
				openClosePositionModal={() => {}}
				error={error}
				marketClosed={isFuturesMarketClosed}
			/>

			<FeeInfoBox dynamicFee={dynamicFee} />
		</div>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 15px;
`;

export default OpenPositionTab;

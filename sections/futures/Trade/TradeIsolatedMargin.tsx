import { FC, memo, useCallback } from 'react';
import styled from 'styled-components';

import Error from 'components/ErrorView';
import Spacer from 'components/Spacer';
import { PositionSide } from 'sdk/types/futures';
import { changeLeverageSide } from 'state/futures/actions';
import { setOrderType } from 'state/futures/reducer';
import { selectFuturesType, selectLeverageSide, selectOrderType } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPricesConnectionError } from 'state/prices/selectors';

import { FeeInfoBox } from '../FeeInfoBox/FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarginInput from '../MarginInput';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import OrderTypeSelector from './OrderTypeSelector';
import SLTPInputs from './SLTPInputs';
import TradeBalance from './TradeBalance';
import OrderPriceInput from './TradePanelPriceInput';

type TradeIsolatedMarginProps = {
	mobile?: boolean;
};

const TradeIsolatedMargin: FC<TradeIsolatedMarginProps> = memo(({ mobile }) => {
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const accountType = useAppSelector(selectFuturesType);
	const orderType = useAppSelector(selectOrderType);
	const pricesConnectionError = useAppSelector(selectPricesConnectionError);

	const handleChangeSide = useCallback(
		(side: PositionSide) => {
			dispatch(changeLeverageSide(side));
		},
		[dispatch]
	);

	return (
		<TradePanelContainer $mobile={mobile}>
			{!mobile && <TradeBalance />}
			<PositionButtons selected={leverageSide} onSelect={handleChangeSide} />

			<MainPanelContent>
				{pricesConnectionError && (
					<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
				)}

				{accountType === 'cross_margin' && (
					<OrderTypeSelector orderType={orderType} setOrderTypeAction={setOrderType} />
				)}

				{accountType === 'cross_margin' && <MarginInput />}

				{orderType !== 'market' && accountType === 'cross_margin' && (
					<>
						<OrderPriceInput />
						<Spacer height={16} />
					</>
				)}

				<OrderSizing />

				<LeverageInput />

				{accountType === 'cross_margin' && <SLTPInputs />}

				<ManagePosition />

				<FeeInfoBox />
			</MainPanelContent>
		</TradePanelContainer>
	);
});

const TradePanelContainer = styled.div<{ $mobile?: boolean }>`
	overflow-y: scroll;
	height: 100%;
`;

const MainPanelContent = styled.div`
	padding: 0 15px;
`;

export default TradeIsolatedMargin;

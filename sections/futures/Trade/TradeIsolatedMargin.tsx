import { memo, useCallback } from 'react';

import Error from 'components/ErrorView';
import SegmentedControl from 'components/SegmentedControl';
import { DEFAULT_DELAYED_LEVERAGE_CAP, ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import { PositionSide } from 'sdk/types/futures';
import { setOpenModal } from 'state/app/reducer';
import { changeLeverageSide } from 'state/futures/actions';
import { setOrderType } from 'state/futures/reducer';
import { selectLeverageSide, selectOrderType, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPricesConnectionError } from 'state/prices/selectors';

import { IsolatedMarginFeeInfoBox } from '../FeeInfoBox/FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import TradePanelHeader from './TradePanelHeader';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = memo(({ isMobile }: Props) => {
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const position = useAppSelector(selectPosition);

	const orderType = useAppSelector(selectOrderType);
	const pricesConnectionError = useAppSelector(selectPricesConnectionError);

	const openDepositModal = useCallback(() => {
		dispatch(setOpenModal('futures_isolated_transfer'));
	}, [dispatch]);

	const handleChangeSide = useCallback(
		(side: PositionSide) => {
			dispatch(changeLeverageSide(side));
		},
		[dispatch]
	);

	const changeOrderType = useCallback(
		(oType: number) => {
			dispatch(setOrderType(oType === 1 ? 'market' : 'delayed_offchain'));
		},
		[dispatch]
	);

	return (
		<div>
			<TradePanelHeader onManageBalance={openDepositModal} accountType="isolated_margin" />
			{pricesConnectionError && (
				<Error message="Failed to connect to price feed. Please try disabling any ad blockers and refresh." />
			)}

			{!isMobile && <MarketInfoBox />}

			{position?.position && position.position.leverage.gte(DEFAULT_DELAYED_LEVERAGE_CAP) && (
				<SegmentedControl
					styleType="check"
					values={ISOLATED_MARGIN_ORDER_TYPES}
					selectedIndex={ISOLATED_MARGIN_ORDER_TYPES.indexOf(orderType)}
					onChange={changeOrderType}
				/>
			)}

			<PositionButtons selected={leverageSide} onSelect={handleChangeSide} />

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<IsolatedMarginFeeInfoBox />
		</div>
	);
});

export default TradeIsolatedMargin;

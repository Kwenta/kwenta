import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import {
	setLeverageSide as setReduxLeverageSide,
	setOrderType as setReduxOrderType,
} from 'state/futures/reducer';
import { selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { balancesState, leverageSideState, orderTypeState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import NextPrice from './NextPrice';
import TradePanelHeader from './TradePanelHeader';
import TransferIsolatedMarginModal from './TransferIsolatedMarginModal';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { susdWalletBalance } = useRecoilValue(balancesState);
	const position = useAppSelector(selectPosition);

	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [openTransferModal, setOpenTransferModal] = useState<boolean>(false);
	const totalMargin = position?.remainingMargin ?? zeroBN;
	const dispatch = useAppDispatch();

	return (
		<div>
			<TradePanelHeader
				onManageBalance={() => setOpenTransferModal(true)}
				balance={totalMargin}
				accountType={'isolated_margin'}
			/>

			{!isMobile && <MarketInfoBox />}

			<StyledSegmentedControl
				styleType="check"
				values={ISOLATED_MARGIN_ORDER_TYPES}
				selectedIndex={ISOLATED_MARGIN_ORDER_TYPES.indexOf(orderType)}
				onChange={(oType: number) => {
					setOrderType(oType === 0 ? 'market' : 'next price');
					dispatch(setReduxOrderType(oType === 0 ? 'market' : 'next price'));
				}}
			/>

			{orderType === 'next price' && <NextPrice />}

			<PositionButtons
				selected={leverageSide}
				onSelect={(side) => {
					setLeverageSide(side);
					dispatch(setReduxLeverageSide(side));
				}}
			/>

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
			{openTransferModal && (
				<TransferIsolatedMarginModal
					defaultTab="deposit"
					sUSDBalance={susdWalletBalance}
					onDismiss={() => setOpenTransferModal(false)}
				/>
			)}
		</div>
	);
};

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

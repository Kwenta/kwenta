import styled from 'styled-components';

import SegmentedControl from 'components/SegmentedControl';
import { ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { setLeverageSide, setOrderType } from 'state/futures/reducer';
import { selectLeverageSide, selectOrderType, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import TradePanelHeader from './TradePanelHeader';
import TransferIsolatedMarginModal from './TransferIsolatedMarginModal';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const openModal = useAppSelector(selectOpenModal);
	const leverageSide = useAppSelector(selectLeverageSide);
	const orderType = useAppSelector(selectOrderType);

	const totalMargin = position?.remainingMargin ?? zeroBN;

	return (
		<div>
			<TradePanelHeader
				onManageBalance={() => dispatch(setOpenModal('futures_isolated_transfer'))}
				balance={totalMargin}
				accountType={'isolated_margin'}
			/>

			{!isMobile && <MarketInfoBox />}

			<StyledSegmentedControl
				styleType="check"
				values={ISOLATED_MARGIN_ORDER_TYPES}
				selectedIndex={ISOLATED_MARGIN_ORDER_TYPES.indexOf(orderType)}
				onChange={(oType: number) => {
					dispatch(setOrderType(oType === 0 ? 'delayed' : 'market'));
				}}
			/>

			{/* {orderType === 'next price' && <NextPrice />} TODO: Replace with any delayed order CTAs */}

			<PositionButtons
				selected={leverageSide}
				onSelect={(side) => {
					dispatch(setLeverageSide(side));
				}}
			/>

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
			{openModal === 'futures_isolated_transfer' && (
				<TransferIsolatedMarginModal
					defaultTab="deposit"
					onDismiss={() => dispatch(setOpenModal(null))}
				/>
			)}
		</div>
	);
};

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

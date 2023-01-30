import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Error from 'components/ErrorView';
import SegmentedControl from 'components/SegmentedControl';
import { DEFAULT_DELAYED_LEVERAGE_CAP, ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import { setOpenModal } from 'state/app/reducer';
import { changeLeverageSide } from 'state/futures/actions';
import { setOrderType } from 'state/futures/reducer';
import { selectLeverageSide, selectOrderType, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPricesConnectionError } from 'state/prices/selectors';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from './ManagePosition';
import OrderWarning from './OrderWarning';
import TradePanelHeader from './TradePanelHeader';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const position = useAppSelector(selectPosition);

	const orderType = useAppSelector(selectOrderType);
	const pricesConnectionError = useAppSelector(selectPricesConnectionError);

	return (
		<div>
			<TradePanelHeader
				onManageBalance={() => dispatch(setOpenModal('futures_isolated_transfer'))}
				accountType={'isolated_margin'}
			/>
			{pricesConnectionError && (
				<Error message="Failed to connect to price feed. Please try disabling any add blockers and refresh." />
			)}

			<Error messageType="warn" message={t('futures.market.trade.perpsv2-disclaimer')} />

			{!isMobile && <MarketInfoBox />}

			{position?.position && position.position.leverage.gte(DEFAULT_DELAYED_LEVERAGE_CAP) && (
				<StyledSegmentedControl
					styleType="check"
					values={ISOLATED_MARGIN_ORDER_TYPES}
					selectedIndex={ISOLATED_MARGIN_ORDER_TYPES.indexOf(orderType)}
					onChange={(oType: number) => {
						const newOrderType = oType === 1 ? 'market' : 'delayedOffchain';
						dispatch(setOrderType(newOrderType));
					}}
				/>
			)}

			<OrderWarning />

			<PositionButtons
				selected={leverageSide}
				onSelect={(side) => {
					dispatch(changeLeverageSide(side));
				}}
			/>

			<OrderSizing />

			<LeverageInput />

			<ManagePosition />

			<FeeInfoBox />
		</div>
	);
};

export default TradeIsolatedMargin;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

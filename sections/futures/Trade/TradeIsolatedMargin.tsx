import { useTranslation } from 'react-i18next';

import Error from 'components/Error';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { changeLeverageSide } from 'state/futures/actions';
import { selectLeverageSide, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import FeeInfoBox from '../FeeInfoBox';
import LeverageInput from '../LeverageInput';
import MarketInfoBox from '../MarketInfoBox';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import DelayedOrderWarning from './DelayedOrderWarning';
import ManagePosition from './ManagePosition';
import TradePanelHeader from './TradePanelHeader';
import TransferIsolatedMarginModal from './TransferIsolatedMarginModal';

type Props = {
	isMobile?: boolean;
};

const TradeIsolatedMargin = ({ isMobile }: Props) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const position = useAppSelector(selectPosition);
	const openModal = useAppSelector(selectOpenModal);
	const totalMargin = position?.remainingMargin ?? zeroBN;

	return (
		<div>
			<TradePanelHeader
				onManageBalance={() => dispatch(setOpenModal('futures_isolated_transfer'))}
				balance={totalMargin}
				accountType={'isolated_margin'}
			/>

			<Error messageType="warn" message={t('futures.market.trade.perpsv2-disclaimer')} />

			{!isMobile && <MarketInfoBox />}

			<DelayedOrderWarning />

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

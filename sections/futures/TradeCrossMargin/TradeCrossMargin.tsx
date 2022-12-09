import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import { FuturesOrderType } from 'queries/futures/types';
import { setOpenModal } from 'state/app/reducer';
import { editTradeOrderPrice } from 'state/futures/actions';
import { setLeverageSide, setOrderType } from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectCrossMarginOrderPrice,
	selectCrossMarginTransferOpen,
	selectFuturesType,
	selectLeverageSide,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { futuresAccountState, showCrossMarginOnboardState } from 'store/futures';

import FeeInfoBox from '../FeeInfoBox';
import OrderPriceInput from '../OrderPriceInput/OrderPriceInput';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import TradePanelHeader from '../Trade/TradePanelHeader';
import CreateAccount from './CreateAccount';
import MarginInfoBox from './CrossMarginInfoBox';
import CrossMarginUnsupported from './CrossMarginUnsupported';
import DepositWithdrawCrossMargin from './DepositWithdrawCrossMargin';

type Props = {
	isMobile?: boolean;
};

export default function TradeCrossMargin({ isMobile }: Props) {
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const { crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const orderType = useAppSelector(selectOrderType);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const openTransferModal = useAppSelector(selectCrossMarginTransferOpen);

	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);

	const onChangeOrderPrice = useCallback(
		(price: string) => {
			dispatch(editTradeOrderPrice(price));
		},
		[dispatch]
	);

	if (!showOnboard && (status === 'refetching' || status === 'initial-fetch')) return <Loader />;

	return (
		<>
			{walletAddress && !crossMarginAvailable ? (
				<CrossMarginUnsupported />
			) : (walletAddress && !crossMarginAddress && status !== 'idle') || showOnboard ? (
				<CreateAccount onShowOnboard={() => setShowOnboard(true)} />
			) : (
				<>
					<TradePanelHeader
						balance={freeMargin}
						accountType={selectedAccountType}
						onManageBalance={() => dispatch(setOpenModal('futures_cross_deposit'))}
					/>

					<MarginInfoBox />
					<SegmentedControl
						styleType="check"
						values={CROSS_MARGIN_ORDER_TYPES}
						selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
						onChange={(index: number) => {
							const type = CROSS_MARGIN_ORDER_TYPES[index];
							setOrderType(type as FuturesOrderType);
							dispatch(setOrderType(type));
							dispatch(editTradeOrderPrice(''));
						}}
					/>
					<OrderSizing isMobile={isMobile} />
					{orderType !== 'market' && (
						<>
							<OrderPriceInput
								isDisabled={freeMargin.eq(0)}
								onChangeOrderPrice={onChangeOrderPrice}
								value={orderPrice}
								orderType={orderType}
							/>
							<Spacer height={16} />
						</>
					)}
					<PositionButtons
						selected={leverageSide}
						onSelect={(side) => {
							setLeverageSide(side);
							dispatch(setLeverageSide(side));
						}}
					/>
					<ManagePosition />
					<FeeInfoBox />
					{openTransferModal && (
						<DepositWithdrawCrossMargin
							defaultTab={'deposit'}
							onDismiss={() => dispatch(setOpenModal(null))}
						/>
					)}
				</>
			)}
		</>
	);
}

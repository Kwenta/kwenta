import { useCallback } from 'react';

import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import { FuturesOrderType } from 'queries/futures/types';
import { setOpenModal } from 'state/app/reducer';
import { changeLeverageSide, editTradeOrderPrice } from 'state/futures/actions';
import { setOrderType, setShowCrossMarginOnboard } from 'state/futures/reducer';
import {
	selectCMAccountQueryStatus,
	selectCrossMarginAccount,
	selectCrossMarginBalanceInfo,
	selectCrossMarginOrderPrice,
	selectCrossMarginSupportedNetwork,
	selectCrossMarginTransferOpen,
	selectFuturesType,
	selectLeverageSide,
	selectOrderType,
	selectPosition,
	selectShowCrossMarginOnboard,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { selectWallet } from 'state/wallet/selectors';

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
	const dispatch = useAppDispatch();

	const leverageSide = useAppSelector(selectLeverageSide);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const orderType = useAppSelector(selectOrderType);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const openTransferModal = useAppSelector(selectCrossMarginTransferOpen);
	const crossMarginAvailable = useAppSelector(selectCrossMarginSupportedNetwork);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const queryStatus = useAppSelector(selectCMAccountQueryStatus);
	const showOnboard = useAppSelector(selectShowCrossMarginOnboard);
	const walletAddress = useAppSelector(selectWallet);

	const onChangeOrderPrice = useCallback(
		(price: string) => {
			dispatch(editTradeOrderPrice(price));
		},
		[dispatch]
	);

	if (
		!showOnboard &&
		!crossMarginAddress &&
		(queryStatus.status === FetchStatus.Loading || queryStatus.status === FetchStatus.Idle)
	)
		return <Loader />;

	return (
		<>
			{walletAddress && !crossMarginAvailable ? (
				<CrossMarginUnsupported />
			) : (walletAddress && !crossMarginAddress && queryStatus.status !== FetchStatus.Idle) ||
			  showOnboard ? (
				<CreateAccount onShowOnboard={() => dispatch(setShowCrossMarginOnboard(true))} />
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
							dispatch(changeLeverageSide(side));
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

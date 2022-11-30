import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesOrderType } from 'queries/futures/types';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import {
	setLeverageSide as setReduxLeverageSide,
	setOrderType as setReduxOrderType,
} from 'state/futures/reducer';
import { selectCrossMarginBalanceInfo, selectMarketAssetRate } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import {
	futuresAccountState,
	futuresAccountTypeState,
	leverageSideState,
	orderTypeState,
	futuresOrderPriceState,
	showCrossMarginOnboardState,
} from 'store/futures';
import { orderPriceInvalidLabel } from 'utils/futures';

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

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [orderPrice, setOrderPrice] = useRecoilState(futuresOrderPriceState);
	const openTransferModal = useAppSelector(selectOpenModal);

	const dispatch = useAppDispatch();

	const { onTradeOrderPriceChange } = useFuturesContext();

	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);

	const onChangeOrderPrice = useCallback(
		(price: string) => {
			const invalidLabel = orderPriceInvalidLabel(price, leverageSide, marketAssetRate, orderType);
			setOrderPrice(price);
			if (!invalidLabel || !price) {
				onTradeOrderPriceChange(price);
			}
		},
		[onTradeOrderPriceChange, setOrderPrice, leverageSide, marketAssetRate, orderType]
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
						onManageBalance={() => dispatch(setOpenModal('cm_deposit_margin'))}
					/>

					<MarginInfoBox />
					<SegmentedControl
						styleType="check"
						values={CROSS_MARGIN_ORDER_TYPES}
						selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
						onChange={(index: number) => {
							const type = CROSS_MARGIN_ORDER_TYPES[index];
							setOrderType(type as FuturesOrderType);
							dispatch(setReduxOrderType(type));
							setOrderPrice('');
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
							dispatch(setReduxLeverageSide(side));
						}}
					/>
					<ManagePosition />
					<FeeInfoBox />
					{openTransferModal && (
						<DepositWithdrawCrossMargin
							defaultTab={openTransferModal === 'cm_deposit_margin' ? 'deposit' : 'withdraw'}
							onDismiss={() => dispatch(setOpenModal(null))}
						/>
					)}
				</>
			)}
		</>
	);
}

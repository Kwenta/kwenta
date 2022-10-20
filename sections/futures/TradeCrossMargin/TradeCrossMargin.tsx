import { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTheme } from 'styled-components';

import DepositArrow from 'assets/svg/futures/deposit-arrow.svg';
import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesOrderType } from 'queries/futures/types';
import {
	futuresAccountState,
	futuresAccountTypeState,
	leverageSideState,
	orderTypeState,
	futuresOrderPriceState,
	marketAssetRateState,
	showCrossMarginOnboardState,
	crossMarginAccountOverviewState,
} from 'store/futures';
import { ceilNumber, floorNumber } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

import FeeInfoBox from '../FeeInfoBox';
import OrderPriceInput from '../OrderPriceInput/OrderPriceInput';
import OrderSizing from '../OrderSizing';
import PositionButtons from '../PositionButtons';
import ManagePosition from '../Trade/ManagePosition';
import MarketsDropdown from '../Trade/MarketsDropdown';
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
	const { colors } = useTheme();

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { freeMargin } = useRecoilValue(crossMarginAccountOverviewState);
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [orderPrice, setOrderPrice] = useRecoilState(futuresOrderPriceState);

	const { onTradeOrderPriceChange } = useFuturesContext();

	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);
	const [openTransferModal, setOpenTransferModal] = useState<'deposit' | 'withdraw' | null>(null);

	const onChangeOrderPrice = useCallback(
		(price: string) => {
			const invalidLabel = orderPriceInvalidLabel(price, leverageSide, marketAssetRate, orderType);
			if (!invalidLabel || !price) {
				onTradeOrderPriceChange(price);
			}
			setOrderPrice(price);
		},
		[onTradeOrderPriceChange, setOrderPrice, leverageSide, marketAssetRate, orderType]
	);

	const headerButtons = walletAddress
		? [
				{
					i18nTitle: 'futures.market.trade.button.deposit',
					icon: <DepositArrow stroke={colors.selectedTheme.yellow} />,
					onClick: () => setOpenTransferModal('deposit'),
				},
				{
					i18nTitle: 'futures.market.trade.button.withdraw',
					icon: <WithdrawArrow stroke={colors.selectedTheme.yellow} />,
					onClick: () => setOpenTransferModal('withdraw'),
				},
		  ]
		: [];

	if (!showOnboard && (status === 'refetching' || status === 'initial-fetch')) return <Loader />;

	return (
		<>
			{walletAddress && !crossMarginAvailable ? (
				<CrossMarginUnsupported />
			) : (walletAddress && !crossMarginAddress && status !== 'idle') || showOnboard ? (
				<CreateAccount onShowOnboard={() => setShowOnboard(true)} />
			) : (
				<>
					{!isMobile && <MarketsDropdown />}

					<TradePanelHeader accountType={selectedAccountType} buttons={headerButtons} />

					<MarginInfoBox />
					<SegmentedControl
						styleType="check"
						values={CROSS_MARGIN_ORDER_TYPES}
						selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
						onChange={(index: number) => {
							const type = CROSS_MARGIN_ORDER_TYPES[index];
							setOrderType(type as FuturesOrderType);
							const price =
								(type === 'limit' && leverageSide === 'long') ||
								(type === 'stop' && leverageSide === 'short')
									? floorNumber(marketAssetRate, 0)
									: (type === 'stop' && leverageSide === 'long') ||
									  (type === 'limit' && leverageSide === 'short')
									? ceilNumber(marketAssetRate, 0)
									: '';
							onChangeOrderPrice(String(price));
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
					<PositionButtons selected={leverageSide} onSelect={setLeverageSide} />
					<ManagePosition />
					<FeeInfoBox />
					{openTransferModal && (
						<DepositWithdrawCrossMargin
							defaultTab={openTransferModal}
							onDismiss={() => setOpenTransferModal(null)}
						/>
					)}
				</>
			)}
		</>
	);
}

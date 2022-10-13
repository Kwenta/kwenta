import { useConnectModal } from '@rainbow-me/rainbowkit';
import { wei } from '@synthetixio/wei';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DepositArrow from 'assets/svg/futures/deposit-arrow.svg';
import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import StyledSlider from 'components/Slider/StyledSlider';
import Spacer from 'components/Spacer';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesOrderType } from 'queries/futures/types';
import {
	futuresAccountState,
	futuresAccountTypeState,
	leverageSideState,
	futuresTradeInputsState,
	orderTypeState,
	futuresOrderPriceState,
	marketAssetRateState,
	showCrossMarginOnboardState,
	crossMarginAccountOverviewState,
} from 'store/futures';
import { FlexDivRow } from 'styles/common';
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

	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { freeMargin } = useRecoilValue(crossMarginAccountOverviewState);

	const { susdSize } = useRecoilValue(futuresTradeInputsState);
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const [orderPrice, setOrderPrice] = useRecoilState(futuresOrderPriceState);

	const { onTradeAmountChange, maxUsdInputAmount, onTradeOrderPriceChange } = useFuturesContext();
	const { openConnectModal: connectWallet } = useConnectModal();

	const [percent, setPercent] = useState(0);
	const [usdAmount, setUsdAmount] = useState(susdSize);
	const [showOnboard, setShowOnboard] = useRecoilState(showCrossMarginOnboardState);
	const [openTransferModal, setOpenTransferModal] = useState<'deposit' | 'withdraw' | null>(null);

	// eslint-disable-next-line
	const onChangeMarginPercent = useCallback(
		(value, commit = false) => {
			setPercent(value);
			const fraction = value / 100;
			const usdAmount = maxUsdInputAmount.mul(fraction).toString();
			const usdValue = Number(usdAmount).toFixed(0);
			setUsdAmount(usdValue);
			onTradeAmountChange(usdValue, 'usd', { simulateChange: !commit });
		},
		[onTradeAmountChange, maxUsdInputAmount]
	);

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

	useEffect(() => {
		if (susdSize !== usdAmount) {
			if (!susdSize || maxUsdInputAmount.eq(0)) {
				setPercent(0);
				return;
			}

			const percent = wei(susdSize).div(maxUsdInputAmount).mul(100).toNumber();
			setPercent(Number(percent.toFixed(2)));
		}
		// eslint-disable-next-line
	}, [susdSize]);

	const headerButtons = walletAddress
		? [
				{
					i18nTitle: 'futures.market.trade.button.deposit',
					Icon: DepositArrow,
					onClick: () => setOpenTransferModal('deposit'),
				},
				{
					i18nTitle: 'futures.market.trade.button.withdraw',
					Icon: WithdrawArrow,
					onClick: () => setOpenTransferModal('withdraw'),
				},
		  ]
		: [
				{
					i18nTitle: 'futures.market.trade.button.connect-wallet',
					onClick: connectWallet,
				},
		  ];

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
								type === 'limit'
									? floorNumber(marketAssetRate)
									: type === 'stop'
									? ceilNumber(marketAssetRate)
									: '';
							onChangeOrderPrice(String(price));
						}}
					/>
					<OrderSizing isMobile={isMobile} />
					<SliderRow>
						<StyledSlider
							minValue={0}
							maxValue={100}
							step={1}
							disabled={freeMargin.eq(0)}
							defaultValue={percent}
							value={percent}
							onChange={(_, value) => onChangeMarginPercent(value, false)}
							onChangeCommitted={(_, value) => onChangeMarginPercent(value, true)}
							marks={[
								{ value: 0, label: `0%` },
								{ value: 100, label: `100%` },
							]}
							valueLabelDisplay="on"
							valueLabelFormat={(v) => `${v}%`}
							$currentMark={percent}
						/>
					</SliderRow>
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

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 32px;
	position: relative;
`;

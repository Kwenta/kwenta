import React, { useMemo, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { CurrencyKey, Synths } from 'constants/currency';

import Button from 'components/Button';
import { zeroBN } from 'utils/formatters/number';
import { PositionSide } from '../types';
import { useRecoilState } from 'recoil';
import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { walletAddressState } from 'store/wallet';
import TransactionNotifier from 'containers/TransactionNotifier';

import LeverageInput from '../LeverageInput';
import TradeConfirmationModal from './TradeConfirmationModal';
import { useRouter } from 'next/router';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import MarketsDropdown from './MarketsDropdown';
import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';
import { getFuturesMarketContract } from 'queries/futures/utils';
import Connector from 'containers/Connector';
import { getMarketKey } from 'utils/futures';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import NextPrice from './NextPrice';
import { FuturesPosition } from 'queries/futures/types';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import useGetFuturesMarketLimit from 'queries/futures/useGetFuturesMarketLimit';
import ClosePositionModal from '../PositionCard/ClosePositionModal';

const DEFAULT_MAX_LEVERAGE = wei(10);

type TradeProps = {
	position: FuturesPosition | null;
	refetch(): void;
	onEditPositionInput: (position: { size: string; side: PositionSide }) => void;
	currencyKey: string;
};

const Trade: React.FC<TradeProps> = ({ refetch, onEditPositionInput, position, currencyKey }) => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery, useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const router = useRouter();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthetixjs, network } = Connector.useContainer();

	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);

	const marketAsset = (router.query.market?.[0] as CurrencyKey) ?? null;
	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketAsset);
	const marketQuery = useGetFuturesMarkets();
	const market = marketQuery?.data?.find(({ asset }) => asset === marketAsset) ?? null;
	const marketLimitQuery = useGetFuturesMarketLimit(getMarketKey(marketAsset, network.id));

	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);

	const positionDetails = position?.position ?? null;

	const onPositionClose = () => {
		setTimeout(() => {
			futuresPositionHistoryQuery.refetch();
			refetch();
		}, 5 * 1000);
	};

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [error, setError] = useState<string | null>(null);

	const [leverage, setLeverage] = useState<string>('');

	const [tradeSize, setTradeSize] = useState('');
	const [tradeSizeSUSD, setTradeSizeSUSD] = useState('');
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);
	const [orderType, setOrderType] = useState(0);

	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [feeCost, setFeeCost] = useState<Wei | null>(null);
	const [dynamicFee, setDynamicFee] = useState<Wei | null>(null);
	const [isLeverageValueCommitted, setIsLeverageValueCommitted] = useState<boolean>(true);

	const [isDepositMarginModalOpen, setIsDepositMarginModalOpen] = useState(false);
	const [isWithdrawMarginModalOpen, setIsWithdrawMarginModalOpen] = useState(false);
	const [isTradeConfirmationModalOpen, setIsTradeConfirmationModalOpen] = useState(false);
	const [isNextPriceConfirmationModalOpen, setIsNextPriceConfirmationModalOpen] = useState(false);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : undefined;

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const positionLeverage = position?.position?.leverage ?? wei(0);
	const positionSide = position?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const maxLeverageValue = useMemo(() => {
		if (!positionLeverage) return marketMaxLeverage;
		if (positionLeverage.eq(wei(0))) return marketMaxLeverage;
		if (positionSide === leverageSide) {
			return marketMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(marketMaxLeverage);
		}
	}, [positionLeverage, positionSide, leverageSide, marketMaxLeverage]);

	const maxMarketValueUSD = marketLimitQuery?.data ?? wei(0);
	const marketSize = market?.marketSize ?? wei(0);
	const marketSkew = market?.marketSkew ?? wei(0);

	const isMarketCapReached = useMemo(
		() =>
			leverageSide === PositionSide.LONG
				? marketSize.add(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
				: marketSize.sub(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD),
		[leverageSide, marketSize, marketSkew, marketAssetRate, maxMarketValueUSD]
	);

	const onTradeAmountChange = React.useCallback(
		(value: string, fromLeverage: boolean = false) => {
			const size = fromLeverage ? (value === '' ? '' : wei(value).toNumber().toString()) : value;
			const sizeSUSD = value === '' ? '' : marketAssetRate.mul(Number(value)).toNumber().toString();
			const leverage =
				value === ''
					? ''
					: marketAssetRate
							.mul(Number(value))
							.div(position?.remainingMargin)
							.toString()
							.substring(0, 4);
			setTradeSize(size);
			setTradeSizeSUSD(sizeSUSD);
			setLeverage(leverage);
		},
		[marketAssetRate, position?.remainingMargin]
	);

	useEffect(() => {
		const handleRouteChange = () => {
			setTradeSize('');
			setTradeSizeSUSD('');
			setLeverage('');
		};
		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events]);

	const onTradeAmountSUSDChange = (value: string) => {
		const valueIsNull = value === '' || Number(value) === 0;
		const size = valueIsNull ? '' : wei(value).div(marketAssetRate).toNumber().toString();
		const leverage = valueIsNull
			? ''
			: wei(value).div(position?.remainingMargin).toString().substring(0, 4);
		setTradeSizeSUSD(value);
		setTradeSize(size);
		setLeverage(leverage);
	};

	const onLeverageChange = React.useCallback(
		(value: string) => {
			if (value === '' || Number(value) <= 0) {
				setTradeSize('');
				setTradeSizeSUSD('');
				setLeverage(Number(value) === 0 ? value.substring(0, 4) : '');
			} else {
				const newTradeSize = marketAssetRate.eq(0)
					? 0
					: wei(value)
							.mul(position?.remainingMargin ?? zeroBN)
							.div(marketAssetRate);
				onTradeAmountChange(newTradeSize.toString(), true);
				setLeverage(value.substring(0, 4));
			}
		},
		[position?.remainingMargin, marketAssetRate, onTradeAmountChange]
	);

	const sizeDelta = React.useMemo(
		() => (tradeSize ? wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize) : zeroBN),
		[leverageSide, tradeSize]
	);

	const placeOrderTranslationKey = React.useMemo(() => {
		if (orderType === 1) return 'futures.market.trade.button.place-next-price-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return !position?.remainingMargin || position.remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	}, [position, orderType, isMarketCapReached]);

	const shouldDisplayNextPriceDisclaimer = React.useMemo(
		() =>
			wei(leverage || 0).gte(maxLeverageValue.sub(wei(1))) &&
			wei(leverage || 0).lte(maxLeverageValue),
		[leverage, maxLeverageValue]
	);

	useEffect(() => {
		const getOrderFee = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!walletAddress ||
				!tradeSize ||
				Number(tradeSize) === 0 ||
				!isLeverageValueCommitted ||
				!position ||
				!position.remainingMargin
			) {
				return;
			}
			try {
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const volatilityFee = await synthetixjs!.contracts.Exchanger.dynamicFeeRateForExchange(
					ethers.utils.formatBytes32String('sUSD'),
					ethers.utils.formatBytes32String(marketAsset as string)
				);
				const orderFee = await FuturesMarketContract.orderFee(sizeDelta.toBN());
				setDynamicFee(wei(volatilityFee.feeRate));
				setFeeCost(wei(orderFee.fee));
			} catch (e) {
				console.log(e);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getOrderFee();
	}, [
		tradeSize,
		synthetixjs,
		marketAsset,
		position,
		leverageSide,
		walletAddress,
		isLeverageValueCommitted,
		sizeDelta,
	]);

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${marketAsset?.[0] === 's' ? marketAsset?.substring(1) : marketAsset}`,
		orderType === 1 ? 'submitNextPriceOrderWithTracking' : 'modifyPositionWithTracking',
		[sizeDelta.toBN(), KWENTA_TRACKING_CODE],
		gasPrice,
		{
			enabled:
				!!marketAsset &&
				!!leverage &&
				Number(leverage) >= 0 &&
				maxLeverageValue.gte(Number(leverage)) &&
				!sizeDelta.eq(zeroBN),
		}
	);

	useEffect(() => {
		if (orderTxn.hash) {
			monitorTransaction({
				txHash: orderTxn.hash,
				onTxConfirmed: () => {
					onLeverageChange('');
					setTimeout(async () => {
						futuresPositionHistoryQuery.refetch();
						marketQuery.refetch();
						refetch();
					}, 5 * 1000);
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

	useEffect(() => {
		onEditPositionInput({ size: tradeSize, side: leverageSide });
	}, [leverageSide, tradeSize, onEditPositionInput]);

	return (
		<Panel>
			<MarketsDropdown asset={marketAsset || Synths.sUSD} />
			<MarketActions>
				<MarketActionButton
					disabled={isFuturesMarketClosed}
					onClick={() => setIsDepositMarginModalOpen(true)}
				>
					{t('futures.market.trade.button.deposit')}
				</MarketActionButton>
				<MarketActionButton
					disabled={position?.remainingMargin?.lte(zeroBN) || isFuturesMarketClosed}
					onClick={() => setIsWithdrawMarginModalOpen(true)}
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActions>

			<MarketInfoBox
				totalMargin={position?.remainingMargin ?? zeroBN}
				availableMargin={position?.accessibleMargin ?? zeroBN}
				buyingPower={
					position && position?.remainingMargin.gt(zeroBN)
						? position?.remainingMargin?.mul(market?.maxLeverage ?? zeroBN)
						: zeroBN
				}
				marginUsage={
					position && position?.remainingMargin.gt(zeroBN)
						? position?.remainingMargin
								?.sub(position?.accessibleMargin)
								.div(position?.remainingMargin)
						: zeroBN
				}
				isMarketClosed={isFuturesMarketClosed}
			/>

			<StyledSegmentedControl
				values={['Market', 'Next-Price']}
				selectedIndex={orderType}
				onChange={setOrderType}
			/>

			{orderType === 1 && <NextPrice />}

			<PositionButtons
				selected={leverageSide}
				onSelect={setLeverageSide}
				isMarketClosed={isFuturesMarketClosed}
			/>

			<OrderSizing
				disabled={position?.remainingMargin?.lte(zeroBN)}
				amount={tradeSize}
				amountSUSD={tradeSizeSUSD}
				assetRate={marketAssetRate}
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				onLeverageChange={(value) => onLeverageChange(value)}
				marketAsset={marketAsset || Synths.sUSD}
				maxLeverage={maxLeverageValue}
				totalMargin={position?.remainingMargin ?? zeroBN}
			/>

			<LeverageInput
				currentLeverage={leverage}
				maxLeverage={maxLeverageValue}
				onLeverageChange={(value) => onLeverageChange(value)}
				side={leverageSide}
				setIsLeverageValueCommitted={setIsLeverageValueCommitted}
				currentPosition={position}
				assetRate={marketAssetRate}
				currentTradeSize={tradeSize ? Number(tradeSize) : 0}
				isMarketClosed={isFuturesMarketClosed}
				isDisclaimerDisplayed={orderType === 1 && shouldDisplayNextPriceDisclaimer}
			/>

			<ManageOrderTitle>
				Manage&nbsp; —<span>&nbsp; Adjust your position</span>
			</ManageOrderTitle>

			<ManagePositions>
				<PlaceOrderButton
					variant="primary"
					fullWidth
					disabled={
						!leverage ||
						Number(leverage) < 0 ||
						Number(leverage) > maxLeverageValue.toNumber() ||
						sizeDelta.eq(zeroBN) ||
						!!error ||
						placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum' ||
						isFuturesMarketClosed ||
						isMarketCapReached
					}
					onClick={() => {
						orderType === 1
							? setIsNextPriceConfirmationModalOpen(true)
							: setIsTradeConfirmationModalOpen(true);
					}}
				>
					{t(placeOrderTranslationKey)}
				</PlaceOrderButton>

				{(() => onPositionClose) && (
					<CloseOrderButton
						isRounded={true}
						fullWidth
						variant="danger"
						onClick={() => setClosePositionModalIsVisible(true)}
						disabled={!positionDetails || isFuturesMarketClosed}
						noOutline={true}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				)}
			</ManagePositions>

			{(orderTxn.errorMessage || error) && (
				<ErrorMessage>{orderTxn.errorMessage || error}</ErrorMessage>
			)}

			<FeeInfoBox
				orderType={orderType}
				feeCost={feeCost}
				currencyKey={marketAsset}
				sizeDelta={sizeDelta}
				dynamicFee={dynamicFee}
			/>

			{isDepositMarginModalOpen && (
				<DepositMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={position?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							refetch();
							futuresPositionHistoryQuery.refetch();
							synthsBalancesQuery.refetch();
						}, 5 * 1000);
					}}
					market={marketAsset}
					onDismiss={() => setIsDepositMarginModalOpen(false)}
				/>
			)}

			{isWithdrawMarginModalOpen && (
				<WithdrawMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={position?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							refetch();
							futuresPositionHistoryQuery.refetch();
							synthsBalancesQuery.refetch();
						}, 5 * 1000);
					}}
					market={marketAsset}
					onDismiss={() => setIsWithdrawMarginModalOpen(false)}
				/>
			)}

			{isTradeConfirmationModalOpen && (
				<TradeConfirmationModal
					tradeSize={tradeSize}
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					market={marketAsset}
					side={leverageSide}
					onDismiss={() => setIsTradeConfirmationModalOpen(false)}
				/>
			)}

			{isNextPriceConfirmationModalOpen && (
				<NextPriceConfirmationModal
					tradeSize={tradeSize}
					onConfirmOrder={() => orderTxn.mutate()}
					gasLimit={orderTxn.gasLimit}
					l1Fee={orderTxn.optimismLayerOneFee}
					market={marketAsset}
					side={leverageSide}
					onDismiss={() => setIsNextPriceConfirmationModalOpen(false)}
					feeCost={feeCost}
					positionSize={position?.position?.size ?? null}
					isDisclaimerDisplayed={shouldDisplayNextPriceDisclaimer}
				/>
			)}

			{closePositionModalIsVisible && onPositionClose && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onPositionClose={onPositionClose}
					onDismiss={() => setClosePositionModalIsVisible(false)}
				/>
			)}
		</Panel>
	);
};
export default Trade;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;

const MarketActions = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const MarketActionButton = styled(Button)`
	font-size: 15px;
`;

const ManagePositions = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const PlaceOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
`;

const CloseOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid #ef6868;
	box-shadow: none;
	transition: all 0s ease-in-out;

	&:hover {
		background: ${(props) => props.theme.colors.common.primaryRed};
		color: ${(props) => props.theme.colors.white};
		transform: scale(0.98);
	}

	&:disabled {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
	}
`;

const ErrorMessage = styled.div`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-size: 12px;
	margin-bottom: 16px;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

const ManageOrderTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 12px;
	margin-bottom: 8px;
	margin-left: 14px;

	span {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

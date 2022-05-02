import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { useState } from 'react';
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
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import MarketsDropdown from './MarketsDropdown';
// import SegmentedControl from 'components/SegmentedControl';
import PositionButtons from '../PositionButtons';
import OrderSizing from '../OrderSizing';
import MarketInfoBox from '../MarketInfoBox/MarketInfoBox';
import FeeInfoBox from '../FeeInfoBox';
import DepositMarginModal from './DepositMarginModal';
import WithdrawMarginModal from './WithdrawMarginModal';
import { getFuturesMarketContract } from 'queries/futures/utils';
import Connector from 'containers/Connector';
import { getMarketKey } from 'utils/futures';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import { ethers } from 'ethers';
import ClosePositionModal from '../PositionCard/ClosePositionModal';
const DEFAULT_MAX_LEVERAGE = wei(10);

type PositionCardProps = {
	currencyKey: string;
};

const Trade: React.FC<PositionCardProps> = ({ currencyKey }) => {
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

	const futuresPositionHistoryQuery = useGetFuturesPositionHistory(marketAsset);
	const futuresMarketPositionQuery = useGetFuturesPositionForMarket(
		getMarketKey(marketAsset, network.id)
	);
	const futuresMarketsPosition = futuresMarketPositionQuery?.data ?? null;

	const positionDetails = futuresMarketsPosition?.position ?? null;

	const onPositionClose = () => {
		setTimeout(() => {
			futuresPositionHistoryQuery.refetch();
			futuresMarketPositionQuery.refetch();
		}, 5 * 1000);
	};

	console.log('onPositionClose', onPositionClose);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap?.[Synths.sUSD]?.balance ?? zeroBN;

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [error, setError] = useState<string | null>(null);

	const [leverage, setLeverage] = useState<string>('');

	const [tradeSize, setTradeSize] = useState('');
	const [tradeSizeSUSD, setTradeSizeSUSD] = useState('');
	const [leverageSide, setLeverageSide] = useState<PositionSide>(PositionSide.LONG);

	const [gasSpeed] = useRecoilState(gasSpeedState);
	const [feeCost, setFeeCost] = useState<Wei | null>(null);
	const [isLeverageValueCommitted, setIsLeverageValueCommitted] = useState<boolean>(true);

	const [isDepositMarginModalOpen, setIsDepositMarginModalOpen] = useState(false);
	const [isWithdrawMarginModalOpen, setIsWithdrawMarginModalOpen] = useState(false);
	const [isTradeConfirmationModalOpen, setIsTradeConfirmationModalOpen] = useState(false);

	const gasPrice = ethGasPriceQuery.data != null ? ethGasPriceQuery.data[gasSpeed] : undefined;

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const positionLeverage = futuresMarketPositionQuery?.data?.position?.leverage ?? wei(0);
	const positionSide = futuresMarketPositionQuery?.data?.position?.side;
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

	const onTradeAmountChange = React.useCallback(
		(value: string, fromLeverage: boolean = false) => {
			setTradeSize(fromLeverage ? (value === '' ? '' : wei(value).toNumber().toString()) : value);
			setTradeSizeSUSD(
				value === '' ? '' : marketAssetRate.mul(Number(value)).toNumber().toString()
			);
		},
		[marketAssetRate]
	);

	useEffect(() => {
		const handleRouteChange = () => {
			setTradeSize('');
			setTradeSizeSUSD('');
		};
		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events]);

	useEffect(() => {
		if (Number(tradeSize) && !!futuresMarketsPosition?.remainingMargin) {
			setLeverage(
				marketAssetRate
					.mul(Number(tradeSize))
					.div(futuresMarketsPosition?.remainingMargin)
					.toString()
			);
		} else {
			if (Number(leverage) !== 0) {
				setLeverage('');
			}
		}
	}, [tradeSize, marketAssetRate, futuresMarketsPosition, leverage]);

	const onTradeAmountSUSDChange = (value: string) => {
		setTradeSizeSUSD(value);
		setTradeSize(value === '' ? '' : wei(value).div(marketAssetRate).toNumber().toString());
	};

	const onLeverageChange = React.useCallback(
		(value: string) => {
			if (value === '' || Number(value) <= 0) {
				setLeverage(Number(value) === 0 ? value : '');
				setTradeSize('');
				setTradeSizeSUSD('');
			} else {
				setLeverage(value);
				const newTradeSize = marketAssetRate.eq(0)
					? 0
					: wei(value)
							.mul(futuresMarketsPosition?.remainingMargin ?? zeroBN)
							.div(marketAssetRate);

				onTradeAmountChange(newTradeSize.toString(), true);
			}
		},
		[futuresMarketsPosition?.remainingMargin, marketAssetRate, onTradeAmountChange]
	);

	const sizeDelta = React.useMemo(
		() => (tradeSize ? wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize) : zeroBN),
		[leverageSide, tradeSize]
	);

	const placeOrderTranslationKey = React.useMemo(() => {
		if (!!futuresMarketsPosition?.position) return 'futures.market.trade.button.modify-position';
		return !futuresMarketsPosition?.remainingMargin ||
			futuresMarketsPosition.remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: 'futures.market.trade.button.open-position';
	}, [futuresMarketsPosition]);

	useEffect(() => {
		const getOrderFee = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!walletAddress ||
				!tradeSize ||
				Number(tradeSize) === 0 ||
				!isLeverageValueCommitted ||
				!futuresMarketsPosition ||
				!futuresMarketsPosition.remainingMargin
			) {
				return;
			}
			try {
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const orderFee = await FuturesMarketContract.orderFee(sizeDelta.toBN());
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
		futuresMarketsPosition,
		leverageSide,
		walletAddress,
		isLeverageValueCommitted,
		sizeDelta,
	]);

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${marketAsset?.[0] === 's' ? marketAsset?.substring(1) : marketAsset}`,
		'modifyPositionWithTracking',
		[sizeDelta.toBN(), ethers.utils.formatBytes32String('KWENTA')],
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
					setTimeout(() => {
						futuresMarketPositionQuery.refetch();
						futuresPositionHistoryQuery.refetch();
						marketQuery.refetch();
					}, 5 * 1000);
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

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
					disabled={futuresMarketsPosition?.remainingMargin?.lte(zeroBN) || isFuturesMarketClosed}
					onClick={() => setIsWithdrawMarginModalOpen(true)}
				>
					{t('futures.market.trade.button.withdraw')}
				</MarketActionButton>
			</MarketActions>

			<MarketInfoBox
				totalMargin={futuresMarketsPosition?.remainingMargin ?? zeroBN}
				availableMargin={futuresMarketsPosition?.accessibleMargin ?? zeroBN}
				buyingPower={
					futuresMarketsPosition && futuresMarketsPosition?.remainingMargin.gt(zeroBN)
						? futuresMarketsPosition?.remainingMargin?.mul(market?.maxLeverage ?? zeroBN)
						: zeroBN
				}
				marginUsage={
					futuresMarketsPosition && futuresMarketsPosition?.remainingMargin.gt(zeroBN)
						? futuresMarketsPosition?.remainingMargin
								?.sub(futuresMarketsPosition?.accessibleMargin)
								.div(futuresMarketsPosition?.remainingMargin)
						: zeroBN
				}
				isMarketClosed={isFuturesMarketClosed}
			/>

			{/* <StyledSegmentedControl values={['Market', 'Limit']} selectedIndex={0} onChange={() => {}} /> */}

			<PositionButtons
				selected={leverageSide}
				onSelect={setLeverageSide}
				isMarketClosed={isFuturesMarketClosed}
			/>

			<OrderSizing
				disabled={futuresMarketsPosition?.remainingMargin?.lte(zeroBN)}
				amount={tradeSize}
				amountSUSD={tradeSizeSUSD}
				assetRate={marketAssetRate}
				onAmountChange={onTradeAmountChange}
				onAmountSUSDChange={onTradeAmountSUSDChange}
				marketAsset={marketAsset || Synths.sUSD}
			/>

			<LeverageInput
				currentLeverage={leverage}
				maxLeverage={maxLeverageValue}
				onLeverageChange={(value) => onLeverageChange(value)}
				side={leverageSide}
				setIsLeverageValueCommitted={setIsLeverageValueCommitted}
				currentPosition={futuresMarketsPosition}
				assetRate={marketAssetRate}
				currentTradeSize={tradeSize ? Number(tradeSize) : 0}
				isMarketClosed={isFuturesMarketClosed}
			/>

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
					isFuturesMarketClosed
				}
				onClick={() => {
					setIsTradeConfirmationModalOpen(true);
				}}
			>
				{t(placeOrderTranslationKey)}
			</PlaceOrderButton>

			{/* <CloseOrderButton> */}
			{(() => onPositionClose) && (
				<CloseButton
					isRounded={true}
					size="sm"
					variant="danger"
					onClick={() => setClosePositionModalIsVisible(true)}
					disabled={!positionDetails || isFuturesMarketClosed}
					noOutline={true}
				>
					{t('futures.market.user.position.close-position')}
				</CloseButton>
			)}
			{/* </CloseOrderButton> */}

			{(orderTxn.errorMessage || error) && (
				<ErrorMessage>{orderTxn.errorMessage || error}</ErrorMessage>
			)}

			<FeeInfoBox feeCost={feeCost} />

			{isDepositMarginModalOpen && (
				<DepositMarginModal
					sUSDBalance={sUSDBalance}
					accessibleMargin={futuresMarketsPosition?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							futuresMarketPositionQuery.refetch();
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
					accessibleMargin={futuresMarketsPosition?.accessibleMargin ?? zeroBN}
					onTxConfirmed={() => {
						setTimeout(() => {
							futuresMarketPositionQuery.refetch();
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

const PlaceOrderButton = styled(Button)`
	margin-bottom: 16px;
	height: 55px;
	width: 45%;
	font-size: 13px;
	text-align: center;
`;

// const CloseOrderButton = styled(Button)`
// 	margin-bottom: 16px;
// 	height: 55px;
// `;

const CloseButton = styled(Button)`
	margin-bottom: 16px;
	height: 55px;
	font-size: 13px;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid #ef6868;
	box-shadow: none;
	min-width: 100px;
	width: 45%;
	padding: 0;
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

// const StyledSegmentedControl = styled(SegmentedControl)`
// 	margin-bottom: 16px;
// `;

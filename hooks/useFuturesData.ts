import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import {
	CROSS_MARGIN_ENABLED,
	DEFAULT_FUTURES_MARGIN_TYPE,
	DEFAULT_LEVERAGE,
} from 'constants/defaults';
import {
	CROSS_MARGIN_ORDER_TYPES,
	ISOLATED_MARGIN_ORDER_TYPES,
	ORDER_KEEPER_ETH_DEPOSIT,
} from 'constants/futures';
import Connector from 'containers/Connector';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import { KWENTA_TRACKING_CODE, ORDER_PREVIEW_ERRORS } from 'queries/futures/constants';
import { PositionSide, FuturesTradeInputs, FuturesAccountType } from 'queries/futures/types';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { getFuturesMarketContract } from 'queries/futures/utils';
import {
	crossMarginMarginDeltaState,
	currentMarketState,
	tradeFeesState,
	futuresAccountState,
	leverageSideState,
	marketAssetRateState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	futuresTradeInputsState,
	crossMarginSettingsState,
	futuresAccountTypeState,
	preferredLeverageState,
	simulatedTradeState,
	potentialTradeDetailsState,
	futuresOrderPriceState,
	orderFeeCapState,
	isAdvancedOrderState,
	aboveMaxLeverageState,
	crossMarginAccountOverviewState,
} from 'store/futures';
import { zeroBN, floorNumber, weiToString } from 'utils/formatters/number';
import { calculateMarginDelta, getDisplayAsset, MarketKeyByAsset } from 'utils/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from './useCrossMarginContracts';
import usePersistedRecoilState from './usePersistedRecoilState';

const ZERO_TRADE_INPUTS = {
	nativeSize: '',
	susdSize: '',
	nativeSizeDelta: zeroBN,
	susdSizeDelta: zeroBN,
	leverage: '',
};

const ZERO_FEES = {
	staticFee: zeroBN,
	crossMarginFee: zeroBN,
	dynamicFeeRate: zeroBN,
	keeperEthDeposit: zeroBN,
	limitStopOrderFee: zeroBN,
	total: zeroBN,
};

const useFuturesData = () => {
	const router = useRouter();
	const { t } = useTranslation();
	const { defaultSynthetixjs: synthetixjs, network, provider } = Connector.useContainer();
	const { useSynthetixTxn } = useSynthetixQueries();

	const getPotentialTrade = useGetFuturesPotentialTradeDetails();
	const crossMarginAccountOverview = useRecoilValue(crossMarginAccountOverviewState);
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();

	const marketAsset = useRecoilValue(currentMarketState);
	const [tradeInputs, setTradeInputs] = useRecoilState(futuresTradeInputsState);
	const setSimulatedTrade = useSetRecoilState(simulatedTradeState);

	const [crossMarginMarginDelta, setCrossMarginMarginDelta] = useRecoilState(
		crossMarginMarginDeltaState
	);
	const [tradeFees, setTradeFees] = useRecoilState(tradeFeesState);
	const leverageSide = useRecoilValue(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const feeCap = useRecoilValue(orderFeeCapState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);
	const aboveMaxLeverage = useRecoilValue(aboveMaxLeverageState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const { crossMarginAvailable, crossMarginAddress } = useRecoilValue(futuresAccountState);
	const { tradeFee: crossMarginTradeFee, stopOrderFee, limitOrderFee } = useRecoilValue(
		crossMarginSettingsState
	);
	const isAdvancedOrder = useRecoilValue(isAdvancedOrderState);
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const setPotentialTradeDetails = useSetRecoilState(potentialTradeDetailsState);
	const [selectedAccountType, setSelectedAccountType] = useRecoilState(futuresAccountTypeState);
	const [preferredLeverage] = usePersistedRecoilState(preferredLeverageState);

	const [maxFee, setMaxFee] = useState(zeroBN);
	const [error, setError] = useState<string | null>(null);

	const tradePrice = useMemo(() => wei(isAdvancedOrder ? orderPrice || zeroBN : marketAssetRate), [
		orderPrice,
		marketAssetRate,
		isAdvancedOrder,
	]);

	const crossMarginAccount = useMemo(() => {
		return crossMarginAvailable ? { freeMargin: crossMarginAccountOverview.freeMargin } : null;
	}, [crossMarginAccountOverview.freeMargin, crossMarginAvailable]);

	const selectedLeverage = useMemo(() => {
		const effectiveLeverage = position?.position?.leverage.toString() || '';
		const leverage = effectiveLeverage || preferredLeverage[marketAsset] || DEFAULT_LEVERAGE;
		return String(Math.min(maxLeverage.toNumber(), Number(leverage)));
	}, [position?.position?.leverage, preferredLeverage, marketAsset, maxLeverage]);

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginAccount?.freeMargin || zeroBN;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginAccount?.freeMargin, selectedAccountType]);

	const clearTradePreview = useCallback(() => {
		setPotentialTradeDetails({
			data: null,
			status: 'idle',
			error: null,
		});
		setTradeFees(ZERO_FEES);
	}, [setPotentialTradeDetails, setTradeFees]);

	const resetTradeState = useCallback(() => {
		setSimulatedTrade(ZERO_TRADE_INPUTS);
		setTradeInputs(ZERO_TRADE_INPUTS);
		setCrossMarginMarginDelta(zeroBN);
		clearTradePreview();
	}, [setSimulatedTrade, setTradeInputs, clearTradePreview, setCrossMarginMarginDelta]);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
		}
		if (aboveMaxLeverage && position?.position?.side === leverageSide) {
			return zeroBN;
		}
		const currentValue = position?.position?.notionalValue || zeroBN;
		let maxUsd = remainingMargin.mul(selectedLeverage);
		maxUsd = leverageSide === 'long' ? maxUsd.sub(currentValue) : maxUsd.add(currentValue);
		const maxCrossMarginFee = maxUsd.mul(crossMarginTradeFee);
		const fees = maxFee.add(maxCrossMarginFee) || zeroBN;
		maxUsd = maxUsd.sub(fees.mul(selectedLeverage));
		const buffer = maxUsd.mul(0.01);
		return maxUsd.abs().sub(buffer);
	}, [
		selectedLeverage,
		maxLeverage,
		maxFee,
		aboveMaxLeverage,
		remainingMargin,
		leverageSide,
		selectedAccountType,
		crossMarginTradeFee,
		position?.position?.notionalValue,
		position?.position?.side,
	]);

	const getTradeFee = useCallback(
		(size: Wei) => {
			if (!synthetixjs) return ZERO_FEES;
			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs.contracts);
			return FuturesMarketContract.orderFee(size.toBN());
		},
		[synthetixjs, marketAsset]
	);

	const getCrossMarginEthBal = useCallback(async () => {
		if (!crossMarginAddress) return zeroBN;
		const bal = await provider.getBalance(crossMarginAddress);
		return wei(bal);
	}, [crossMarginAddress, provider]);

	const calculateCrossMarginFee = useCallback(
		(susdSizeDelta: Wei) => {
			if (orderType !== 'limit' && orderType !== 'stop market') return zeroBN;
			const advancedOrderFeeRate = orderType === 'limit' ? limitOrderFee : stopOrderFee;
			return susdSizeDelta.abs().mul(advancedOrderFeeRate);
		},
		[orderType, stopOrderFee, limitOrderFee]
	);

	const calculateFees = useCallback(
		async (susdSizeDelta: Wei, nativeSizeDelta: Wei) => {
			if (!synthetixjs) return ZERO_FEES;

			const [volatilityFee, orderFee] = await Promise.all([
				synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
					ethers.utils.formatBytes32String('sUSD'),
					ethers.utils.formatBytes32String(marketAsset)
				),
				getTradeFee(nativeSizeDelta),
			]);

			const currentDeposit =
				orderType === 'limit' || orderType === 'stop market'
					? await getCrossMarginEthBal()
					: zeroBN;
			const requiredDeposit = currentDeposit.lt(ORDER_KEEPER_ETH_DEPOSIT)
				? ORDER_KEEPER_ETH_DEPOSIT.sub(currentDeposit)
				: zeroBN;

			const crossMarginFee =
				selectedAccountType === 'cross_margin'
					? susdSizeDelta.abs().mul(crossMarginTradeFee)
					: zeroBN;
			const limitStopOrderFee = calculateCrossMarginFee(susdSizeDelta);
			const orderFeeWei = wei(orderFee.fee);
			const volatilityFeeWei = wei(volatilityFee.feeRate);

			const fees = {
				staticFee: orderFeeWei,
				crossMarginFee: crossMarginFee,
				dynamicFeeRate: volatilityFeeWei,
				keeperEthDeposit: requiredDeposit,
				limitStopOrderFee: limitStopOrderFee,
				total: orderFeeWei.add(crossMarginFee).add(limitStopOrderFee),
			};
			setTradeFees(fees);
			return fees;
		},
		[
			crossMarginTradeFee,
			selectedAccountType,
			marketAsset,
			synthetixjs,
			orderType,
			calculateCrossMarginFee,
			setTradeFees,
			getTradeFee,
			getCrossMarginEthBal,
		]
	);

	// eslint-disable-next-line
	const debounceFetchPreview = useCallback(
		debounce(async (nextTrade: FuturesTradeInputs, fromLeverage = false) => {
			setError(null);
			try {
				const fees = await calculateFees(nextTrade.susdSizeDelta, nextTrade.nativeSizeDelta);
				let nextMarginDelta = zeroBN;
				if (selectedAccountType === 'cross_margin') {
					nextMarginDelta =
						nextTrade.nativeSizeDelta.abs().gt(0) || fromLeverage
							? await calculateMarginDelta(nextTrade, fees, position)
							: zeroBN;
					setCrossMarginMarginDelta(nextMarginDelta);
				}
				getPotentialTrade(
					nextTrade.nativeSizeDelta,
					nextMarginDelta,
					Number(nextTrade.leverage),
					nextTrade.orderPrice
				);
			} catch (err) {
				if (Object.values(ORDER_PREVIEW_ERRORS).includes(err.message)) {
					setError(err.message);
				} else {
					setError(t('futures.market.trade.preview.error'));
				}
				clearTradePreview();
				logError(err);
			}
		}, 500),
		[
			setError,
			calculateFees,
			getPotentialTrade,
			calculateMarginDelta,
			position,
			orderPrice,
			orderType,
			selectedAccountType,
			logError,
			setCrossMarginMarginDelta,
		]
	);

	const onStagePositionChange = useCallback(
		(trade: FuturesTradeInputs) => {
			setTradeInputs(trade);
			setSimulatedTrade(null);
			debounceFetchPreview(trade);
		},
		[setTradeInputs, setSimulatedTrade, debounceFetchPreview]
	);

	const onTradeAmountChange = useCallback(
		(
			value: string,
			currencyType: 'usd' | 'native',
			options?: { simulateChange?: boolean; crossMarginLeverage?: Wei }
		) => {
			if (!value || tradePrice.eq(0)) {
				resetTradeState();
				return;
			}

			const positiveTrade = leverageSide === PositionSide.LONG;
			const nativeSize = currencyType === 'native' ? wei(value) : wei(value).div(tradePrice);
			const usdSize = currencyType === 'native' ? tradePrice.mul(value) : wei(value);
			const changeEnabled = remainingMargin.gt(0) && value !== '';
			const isolatedMarginLeverage = changeEnabled ? usdSize.div(remainingMargin) : zeroBN;

			const inputLeverage =
				selectedAccountType === 'cross_margin'
					? options?.crossMarginLeverage ?? wei(selectedLeverage)
					: isolatedMarginLeverage;
			let leverage = remainingMargin.eq(0) ? zeroBN : inputLeverage;
			leverage = maxLeverage.gt(leverage) ? leverage : maxLeverage;

			const newTradeInputs = {
				nativeSize: changeEnabled ? weiToString(nativeSize) : '',
				susdSize: changeEnabled ? weiToString(usdSize) : '',
				nativeSizeDelta: positiveTrade ? nativeSize : nativeSize.neg(),
				susdSizeDelta: positiveTrade ? usdSize : usdSize.neg(),
				orderPrice: tradePrice,
				leverage: String(floorNumber(leverage)),
			};

			if (options?.simulateChange) {
				// Allows us to keep it snappy updating the input values
				setSimulatedTrade(newTradeInputs);
			} else {
				onStagePositionChange(newTradeInputs);
			}
		},
		[
			tradePrice,
			remainingMargin,
			maxLeverage,
			selectedLeverage,
			selectedAccountType,
			leverageSide,
			resetTradeState,
			setSimulatedTrade,
			onStagePositionChange,
		]
	);

	const onChangeOpenPosLeverage = useCallback(
		async (leverage: number) => {
			debounceFetchPreview(
				{
					leverage: String(leverage),
					nativeSize: '0',
					susdSize: '0',
					susdSizeDelta: zeroBN,
					nativeSizeDelta: zeroBN,
				},
				true
			);
		},
		[debounceFetchPreview]
	);

	const onLeverageChange = useCallback(
		(leverage: number) => {
			if (selectedAccountType === 'cross_margin') {
				if (position?.position) {
					onChangeOpenPosLeverage(leverage);
				} else {
					onTradeAmountChange('', 'usd', {
						crossMarginLeverage: wei(leverage),
					});
				}
			} else {
				if (leverage <= 0) {
					resetTradeState();
				} else {
					const newTradeSize =
						marketAssetRate.eq(0) || remainingMargin.eq(0)
							? ''
							: wei(leverage).mul(remainingMargin).div(marketAssetRate).toString();
					onTradeAmountChange(newTradeSize, 'native');
				}
			}
		},
		[
			remainingMargin,
			marketAssetRate,
			selectedAccountType,
			position?.position,
			resetTradeState,
			onTradeAmountChange,
			onChangeOpenPosLeverage,
		]
	);

	const onTradeOrderPriceChange = useCallback(
		(price: string) => {
			if (price && tradeInputs.susdSize) {
				// Recalc the trade
				onTradeAmountChange(tradeInputs.susdSize, 'usd');
			}
		},
		[tradeInputs, onTradeAmountChange]
	);

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(marketAsset)}`,
		orderType === 'next price' ? 'submitNextPriceOrderWithTracking' : 'modifyPositionWithTracking',
		[tradeInputs.nativeSizeDelta.toBN(), KWENTA_TRACKING_CODE],
		{},
		{
			enabled:
				selectedAccountType === 'isolated_margin' &&
				!!marketAsset &&
				!!tradeInputs.leverage &&
				Number(tradeInputs.leverage) >= 0 &&
				maxLeverage.gte(tradeInputs.leverage) &&
				!tradeInputs.nativeSizeDelta.eq(zeroBN),
		}
	);

	const submitCrossMarginOrder = useCallback(
		async (fromEditLeverage?: boolean) => {
			if (!crossMarginAccountContract) return;
			if (orderType === 'market' || fromEditLeverage) {
				const newPosition = [
					{
						marketKey: formatBytes32String(MarketKeyByAsset[marketAsset]),
						marginDelta: crossMarginMarginDelta.toBN(),
						sizeDelta: tradeInputs.nativeSizeDelta.toBN(),
					},
				];
				return await crossMarginAccountContract.distributeMargin(newPosition);
			}
			const enumType = orderType === 'limit' ? 0 : 1;

			return await crossMarginAccountContract.placeOrderWithFeeCap(
				formatBytes32String(MarketKeyByAsset[marketAsset]),
				crossMarginMarginDelta.toBN(),
				tradeInputs.nativeSizeDelta.toBN(),
				wei(orderPrice).toBN(),
				enumType,
				feeCap.toBN(),
				{ value: tradeFees.keeperEthDeposit.toBN() }
			);
		},
		[
			crossMarginAccountContract,
			marketAsset,
			orderPrice,
			orderType,
			feeCap,
			crossMarginMarginDelta,
			tradeInputs.nativeSizeDelta,
			tradeFees.keeperEthDeposit,
		]
	);

	const submitIsolatedMarginOrder = useCallback(() => {
		orderTxn.mutate();
	}, [orderTxn]);

	useEffect(() => {
		if (orderTxn.hash) {
			monitorTransaction({
				txHash: orderTxn.hash,
				onTxConfirmed: () => {
					resetTradeState();
					handleRefetch('modify-position');
					refetchUntilUpdate('account-margin-change');
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

	useEffect(() => {
		const getMaxFee = async () => {
			if (remainingMargin.eq(0) || tradePrice.eq(0)) {
				return;
			}
			try {
				const currentValue = position?.position?.notionalValue || zeroBN;
				let maxUsd = remainingMargin.mul(selectedLeverage);
				maxUsd = leverageSide === 'long' ? maxUsd.sub(currentValue) : maxUsd.add(currentValue);
				const maxSize = maxUsd.gt(0) ? maxUsd.div(tradePrice) : zeroBN;
				const maxOrderFee = await getTradeFee(maxSize);
				setMaxFee(wei(maxOrderFee.fee));
			} catch (e) {
				logError(e);
			}
		};
		getMaxFee();
	}, [
		setMaxFee,
		getTradeFee,
		leverageSide,
		position?.position?.notionalValue,
		remainingMargin,
		tradePrice,
		selectedLeverage,
	]);

	useEffect(() => {
		if (selectedAccountType === 'cross_margin' && !CROSS_MARGIN_ORDER_TYPES.includes(orderType)) {
			setOrderType('market');
		} else if (
			selectedAccountType === 'isolated_margin' &&
			!ISOLATED_MARGIN_ORDER_TYPES.includes(orderType)
		) {
			setOrderType('market');
		}
		onTradeAmountChange(tradeInputs.susdSize, 'usd');

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedAccountType, orderType, network.id]);

	useEffect(() => {
		const handleRouteChange = () => {
			resetTradeState();
		};
		router.events.on('routeChangeStart', handleRouteChange);
		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, resetTradeState]);

	useEffect(() => {
		if (tradeInputs.susdSizeDelta.eq(0)) return;
		onTradeAmountChange(tradeInputs.susdSize, 'usd');
		// Only want to react to leverage side change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leverageSide]);

	useEffect(() => {
		resetTradeState();
		// Clear trade state when switching address
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [crossMarginAddress]);

	useEffect(() => {
		if (!CROSS_MARGIN_ENABLED) {
			setSelectedAccountType(DEFAULT_FUTURES_MARGIN_TYPE);
			return;
		}
		const routerType =
			typeof router.query.accountType === 'string'
				? (router.query.accountType as FuturesAccountType)
				: DEFAULT_FUTURES_MARGIN_TYPE;
		const accountType = ['cross_margin', 'isolated_margin'].includes(routerType)
			? routerType
			: DEFAULT_FUTURES_MARGIN_TYPE;
		setSelectedAccountType(accountType);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.accountType]);

	return {
		onLeverageChange,
		onTradeAmountChange,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		resetTradeState,
		onTradeOrderPriceChange,
		marketAssetRate,
		position,
		marketAsset,
		market,
		orderTxn,
		maxUsdInputAmount,
		tradeFees,
		selectedLeverage,
		error,
		debounceFetchPreview,
	};
};

export default useFuturesData;

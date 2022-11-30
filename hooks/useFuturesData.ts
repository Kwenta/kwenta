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
import {
	fetchIsolatedMarginPositions,
	fetchCrossMarginAccountData,
	fetchSharedFuturesData,
} from 'state/futures/actions';
import {
	setCrossMarginTradeInputs,
	setFuturesAccountType,
	setOrderType as setReduxOrderType,
} from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectCrossMarginAccount,
	selectMarketAssetRate,
	selectPosition,
	selectMaxLeverage,
	selectAboveMaxLeverage,
	selectMarkets,
} from 'state/futures/selectors';
import { selectMarketAsset, selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector, useAppDispatch, useStartPollingAction } from 'state/hooks';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import {
	crossMarginMarginDeltaState,
	tradeFeesState,
	futuresAccountState,
	leverageSideState,
	orderTypeState,
	futuresTradeInputsState,
	crossMarginSettingsState,
	futuresAccountTypeState,
	preferredLeverageState,
	simulatedTradeState,
	potentialTradeDetailsState,
	futuresOrderPriceState,
	orderFeeCapState,
	isAdvancedOrderState,
} from 'store/futures';
import { computeMarketFee } from 'utils/costCalculations';
import { zeroBN, floorNumber, weiToString } from 'utils/formatters/number';
import {
	calculateMarginDelta,
	getDisplayAsset,
	MarketKeyByAsset,
	serializeCrossMarginTradeInputs,
} from 'utils/futures';
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
	const {
		defaultSynthetixjs: synthetixjs,
		network,
		provider,
		providerReady,
	} = Connector.useContainer();
	const { useSynthetixTxn } = useSynthetixQueries();
	const { crossMarginAvailable } = useRecoilValue(futuresAccountState);

	const dispatch = useAppDispatch();
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);

	const startPolling = useStartPollingAction();

	const getPotentialTrade = useGetFuturesPotentialTradeDetails();
	const crossMarginBalanceInfo = useAppSelector(selectCrossMarginBalanceInfo);
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();

	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const marketAsset = useAppSelector(selectMarketAsset);
	const [tradeInputs, setTradeInputs] = useRecoilState(futuresTradeInputsState);
	const setSimulatedTrade = useSetRecoilState(simulatedTradeState);

	const [crossMarginMarginDelta, setCrossMarginMarginDelta] = useRecoilState(
		crossMarginMarginDeltaState
	);
	const [tradeFees, setTradeFees] = useRecoilState(tradeFeesState);
	const leverageSide = useRecoilValue(leverageSideState);
	const [orderType, setOrderType] = useRecoilState(orderTypeState);
	const feeCap = useRecoilValue(orderFeeCapState);
	const position = useAppSelector(selectPosition);
	const aboveMaxLeverage = useAppSelector(selectAboveMaxLeverage);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const { tradeFee: crossMarginTradeFee, stopOrderFee, limitOrderFee } = useRecoilValue(
		crossMarginSettingsState
	);
	const isAdvancedOrder = useRecoilValue(isAdvancedOrderState);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const setPotentialTradeDetails = useSetRecoilState(potentialTradeDetailsState);
	const [selectedAccountType, setSelectedAccountType] = useRecoilState(futuresAccountTypeState);
	const [preferredLeverage] = usePersistedRecoilState(preferredLeverageState);
	const market = useAppSelector(selectMarketInfo);

	const [maxFee, setMaxFee] = useState(zeroBN);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Poll shared futures data
		if (providerReady) {
			startPolling('fetchSharedFuturesData', fetchSharedFuturesData, 6000);
		}
		// eslint-disable-next-line
	}, [providerReady, networkId]);

	useEffect(() => {
		// Poll isolated margin data
		if (markets.length && wallet && selectedAccountType === 'isolated_margin') {
			startPolling('fetchIsolatedMarginPositions', fetchIsolatedMarginPositions, 60000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, selectedAccountType, networkId]);

	useEffect(() => {
		// Poll cross margin data
		if (markets.length && wallet && crossMarginAddress) {
			startPolling('fetchCrossMarginAccountData', fetchCrossMarginAccountData, 60000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, crossMarginAddress, networkId]);

	const tradePrice = useMemo(() => wei(isAdvancedOrder ? orderPrice || zeroBN : marketAssetRate), [
		orderPrice,
		marketAssetRate,
		isAdvancedOrder,
	]);

	const crossMarginAccount = useMemo(() => {
		return crossMarginAvailable ? { freeMargin: crossMarginBalanceInfo.freeMargin } : null;
	}, [crossMarginBalanceInfo.freeMargin, crossMarginAvailable]);

	const freeMargin = useMemo(() => crossMarginAccount?.freeMargin ?? zeroBN, [
		crossMarginAccount?.freeMargin,
	]);

	const selectedLeverage = useMemo(() => {
		const leverage = preferredLeverage[marketAsset] || DEFAULT_LEVERAGE;
		return String(Math.min(maxLeverage.toNumber(), Number(leverage)));
	}, [preferredLeverage, marketAsset, maxLeverage]);

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
		dispatch(setCrossMarginTradeInputs(serializeCrossMarginTradeInputs(ZERO_TRADE_INPUTS)));
		setSimulatedTrade(ZERO_TRADE_INPUTS);
		setTradeInputs(ZERO_TRADE_INPUTS);
		setCrossMarginMarginDelta(zeroBN);
		clearTradePreview();
	}, [setSimulatedTrade, setTradeInputs, clearTradePreview, setCrossMarginMarginDelta, dispatch]);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
		}
		if (aboveMaxLeverage && position?.position?.side === leverageSide) {
			return zeroBN;
		}

		const totalMargin =
			position?.position?.side === leverageSide
				? freeMargin
				: freeMargin.add(position?.remainingMargin ?? zeroBN);

		let maxUsd = totalMargin.mul(selectedLeverage);
		if (position?.position?.side !== leverageSide) {
			const notionalValue = position?.position?.size.mul(tradePrice);
			maxUsd = maxUsd.add(notionalValue ?? zeroBN);
		}

		maxUsd = maxUsd.sub(maxFee.mul(selectedLeverage));
		let buffer = maxUsd.mul(0.01);

		return maxUsd.abs().sub(buffer);
	}, [
		selectedLeverage,
		maxLeverage,
		maxFee,
		aboveMaxLeverage,
		freeMargin,
		remainingMargin,
		leverageSide,
		tradePrice,
		selectedAccountType,
		position?.position?.size,
		position?.remainingMargin,
		position?.position?.side,
	]);

	const advancedOrderFeeRate = useMemo(() => {
		switch (orderType) {
			case 'limit':
				return limitOrderFee;
			case 'stop market':
				return stopOrderFee;
			default:
				return zeroBN;
		}
	}, [orderType, limitOrderFee, stopOrderFee]);

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

	const totalFeeRate = useCallback(
		async (sizeDelta: Wei) => {
			const [dynamicFeeRate] = await Promise.all([
				synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
					ethers.utils.formatBytes32String('sUSD'),
					ethers.utils.formatBytes32String(marketAsset)
				),
			]);
			const staticRate = computeMarketFee(market, sizeDelta);

			let total = crossMarginTradeFee
				.add(dynamicFeeRate.feeRate)
				.add(staticRate)
				.add(advancedOrderFeeRate);

			return total;
		},
		[
			market,
			marketAsset,
			crossMarginTradeFee,
			advancedOrderFeeRate,
			synthetixjs.contracts.Exchanger,
		]
	);

	const calculateFees = useCallback(
		async (susdSizeDelta: Wei, nativeSizeDelta: Wei) => {
			if (!synthetixjs) return ZERO_FEES;

			const volatilityFeeRate = await synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
				ethers.utils.formatBytes32String('sUSD'),
				ethers.utils.formatBytes32String(marketAsset)
			);
			const volatilityFeeWei = wei(volatilityFeeRate.feeRate);
			const susdSize = susdSizeDelta.abs();
			const staticRate = computeMarketFee(market, nativeSizeDelta);
			const tradeFee = susdSize.mul(staticRate).add(susdSize.mul(volatilityFeeWei));

			const currentDeposit =
				orderType === 'limit' || orderType === 'stop market'
					? await getCrossMarginEthBal()
					: zeroBN;
			const requiredDeposit = currentDeposit.lt(ORDER_KEEPER_ETH_DEPOSIT)
				? ORDER_KEEPER_ETH_DEPOSIT.sub(currentDeposit)
				: zeroBN;

			const crossMarginFee =
				selectedAccountType === 'cross_margin' ? susdSize.mul(crossMarginTradeFee) : zeroBN;
			const limitStopOrderFee = calculateCrossMarginFee(susdSizeDelta);
			const tradeFeeWei = wei(tradeFee);

			const fees = {
				staticFee: tradeFeeWei,
				crossMarginFee: crossMarginFee,
				dynamicFeeRate: volatilityFeeWei,
				keeperEthDeposit: requiredDeposit,
				limitStopOrderFee: limitStopOrderFee,
				total: tradeFeeWei.add(crossMarginFee).add(limitStopOrderFee),
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
			market,
			calculateCrossMarginFee,
			setTradeFees,
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
			usdPrice: Wei,
			currencyType: 'usd' | 'native',
			options?: { simulateChange?: boolean; crossMarginLeverage?: Wei }
		) => {
			if (!value || usdPrice.eq(0)) {
				resetTradeState();
				return;
			}
			const positiveTrade = leverageSide === PositionSide.LONG;
			const nativeSize = currencyType === 'native' ? wei(value) : wei(value).div(usdPrice);
			const usdSize = currencyType === 'native' ? usdPrice.mul(value) : wei(value);
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
				orderPrice: usdPrice,
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
				onTradeAmountChange('', tradePrice, 'usd', {
					crossMarginLeverage: wei(leverage),
				});
			} else {
				if (leverage <= 0) {
					resetTradeState();
				} else {
					const newTradeSize =
						marketAssetRate.eq(0) || remainingMargin.eq(0)
							? ''
							: wei(leverage).mul(remainingMargin).div(marketAssetRate).toString();
					onTradeAmountChange(newTradeSize, tradePrice, 'native');
				}
			}
		},
		[
			remainingMargin,
			marketAssetRate,
			selectedAccountType,
			tradePrice,
			resetTradeState,
			onTradeAmountChange,
		]
	);

	const onTradeOrderPriceChange = useCallback(
		(price: string) => {
			if (price && tradeInputs.susdSize) {
				// Recalc the trade
				onTradeAmountChange(tradeInputs.susdSize, wei(price), 'usd');
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
		async (fromEditLeverage?: boolean, gasLimit?: Wei | null) => {
			if (!crossMarginAccountContract) return;
			if (orderType === 'market' || fromEditLeverage) {
				const newPosition = [
					{
						marketKey: formatBytes32String(MarketKeyByAsset[marketAsset]),
						marginDelta: crossMarginMarginDelta.toBN(),
						sizeDelta: tradeInputs.nativeSizeDelta.toBN(),
					},
				];
				return await crossMarginAccountContract.distributeMargin(newPosition, {
					gasLimit: gasLimit?.toBN(),
				});
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
				const totalMargin =
					position?.position?.side === leverageSide
						? freeMargin
						: freeMargin.add(position?.remainingMargin ?? zeroBN);

				let maxUsd = totalMargin.mul(selectedLeverage);
				if (position?.position?.side !== leverageSide) {
					maxUsd = maxUsd.add(position?.position?.notionalValue ?? zeroBN);
				}
				const totalRate = await totalFeeRate(maxUsd);
				const totalMaxFee = maxUsd.mul(totalRate);
				setMaxFee(totalMaxFee);
			} catch (e) {
				logError(e);
			}
		};
		getMaxFee();
	}, [
		setMaxFee,
		totalFeeRate,
		leverageSide,
		position?.remainingMargin,
		position?.position?.notionalValue,
		position?.position?.side,
		remainingMargin,
		freeMargin,
		tradePrice,
		selectedLeverage,
	]);

	useEffect(() => {
		if (selectedAccountType === 'cross_margin' && !CROSS_MARGIN_ORDER_TYPES.includes(orderType)) {
			setOrderType('market');
			dispatch(setReduxOrderType('market'));
		} else if (
			selectedAccountType === 'isolated_margin' &&
			!ISOLATED_MARGIN_ORDER_TYPES.includes(orderType)
		) {
			setOrderType('market');
			dispatch(setReduxOrderType('market'));
		}
		onTradeAmountChange(tradeInputs.susdSize, tradePrice, 'usd');

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, selectedAccountType, orderType, network.id]);

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
		onTradeAmountChange(tradeInputs.susdSize, tradePrice, 'usd');
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
			dispatch(setFuturesAccountType(DEFAULT_FUTURES_MARGIN_TYPE));
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
		dispatch(setFuturesAccountType(accountType));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, router.query.accountType]);

	return {
		onLeverageChange,
		onTradeAmountChange,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		resetTradeState,
		onTradeOrderPriceChange,
		onChangeOpenPosLeverage,
		marketAssetRate,
		position,
		market,
		orderTxn,
		maxUsdInputAmount,
		tradeFees,
		selectedLeverage,
		error,
		debounceFetchPreview,
		tradePrice,
	};
};

export default useFuturesData;

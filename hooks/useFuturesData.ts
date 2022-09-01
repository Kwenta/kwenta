import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { DEFAULT_LEVERAGE } from 'constants/defaults';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { FuturesAccountType, PositionSide, TradeFees, TradeSize } from 'queries/futures/types';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
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
	tradeSizeState,
	crossMarginSettingsState,
	futuresAccountTypeState,
	preferredLeverageState,
	pendingTradeSizeState,
	crossMarginTotalMarginState,
	potentialTradeDetailsState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from './useCrossMarginContracts';
import usePersistedRecoilState from './usePersistedRecoilState';

const DEFAULT_MAX_LEVERAGE = wei(10);

const useFuturesData = () => {
	const router = useRouter();
	const { synthetixjs, network } = Connector.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const { t } = useTranslation();

	const getPotentialTrade = useGetFuturesPotentialTradeDetails();
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();

	const ethGasPriceQuery = useEthGasPriceQuery();

	const marketAsset = useRecoilValue(currentMarketState);
	const [tradeSize, setTradeSize] = useRecoilState(tradeSizeState);
	const setPendingTradeSize = useSetRecoilState(pendingTradeSizeState);

	const [crossMarginMarginDelta, setCrossMarginMarginDelta] = useRecoilState(
		crossMarginMarginDeltaState
	);
	const [tradeFees, setTradeFees] = useRecoilState(tradeFeesState);
	const leverageSide = useRecoilValue(leverageSideState);
	const orderType = useRecoilValue(orderTypeState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const totalMargin = useRecoilValue(crossMarginTotalMarginState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const { tradeFee: crossMarginTradeFee } = useRecoilValue(crossMarginSettingsState);
	const { crossMarginAvailable } = useRecoilValue(futuresAccountState);
	const marketAssetRate = useRecoilValue(marketAssetRateState);
	const setPotentialTradeDetails = useSetRecoilState(potentialTradeDetailsState);
	const [selectedAccountType, setSelectedAccountType] = usePersistedRecoilState(
		futuresAccountTypeState
	);
	const [preferredLeverage] = usePersistedRecoilState(preferredLeverageState);

	const [maxFee, setMaxFee] = useState(zeroBN);
	const [error, setError] = useState<string | null>(null);

	const routerAccountType = useMemo(() => {
		return typeof router.query.accountType === 'string' ? router.query.accountType : 'cross_margin';
	}, [router.query.accountType]);

	const crossMarginAccount = useMemo(() => {
		return crossMarginAvailable
			? { freeMargin: crossMarginAccountOverview.data?.freeMargin }
			: null;
	}, [crossMarginAccountOverview.data?.freeMargin, crossMarginAvailable]);

	const marketMaxLeverage = useMemo(() => {
		return market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;
	}, [market?.maxLeverage]);

	const selectedLeverage = useMemo(() => {
		const effectiveLeverage = position?.position?.leverage.toString() || '';
		return effectiveLeverage || preferredLeverage[marketAsset] || DEFAULT_LEVERAGE;
	}, [position?.position?.leverage, preferredLeverage, marketAsset]);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed];

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginAccount?.freeMargin || zeroBN;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginAccount?.freeMargin, selectedAccountType]);

	const resetTradeState = useCallback(() => {
		setTradeSize({
			nativeSize: '',
			susdSize: '',
			nativeSizeDelta: zeroBN,
			susdSizeDelta: zeroBN,
			leverage: '',
		});
		setPotentialTradeDetails({
			data: null,
			status: 'idle',
			error: null,
		});
		setCrossMarginMarginDelta(zeroBN);
	}, [setTradeSize, setPotentialTradeDetails, setCrossMarginMarginDelta]);

	useEffect(() => {
		const validType = ['cross_margin', 'isolated_margin'].includes(routerAccountType);
		if (validType) {
			setSelectedAccountType(routerAccountType as FuturesAccountType);
		}
	}, [routerAccountType, setSelectedAccountType, network.id]);

	useEffect(() => {
		const handleRouteChange = () => {
			resetTradeState();
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, setTradeSize, resetTradeState]);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
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
		remainingMargin,
		leverageSide,
		selectedAccountType,
		crossMarginTradeFee,
		position?.position?.notionalValue,
	]);

	const calculateFees = useCallback(
		async (susdSizeDelta: Wei, nativeSizeDelta: Wei) => {
			if (!synthetixjs)
				return {
					baseFee: zeroBN,
					dynamicFeeRate: zeroBN,
					crossMarginFee: zeroBN,
					total: zeroBN,
				};

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
			const [volatilityFee, orderFee] = await Promise.all([
				synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
					ethers.utils.formatBytes32String('sUSD'),
					ethers.utils.formatBytes32String(marketAsset)
				),
				FuturesMarketContract.orderFee(nativeSizeDelta.toBN()),
			]);

			const crossMarginFee =
				selectedAccountType === 'cross_margin'
					? susdSizeDelta.abs().mul(crossMarginTradeFee)
					: zeroBN;
			const orderFeeWei = wei(orderFee.fee);
			const volatilityFeeWei = wei(volatilityFee.feeRate);

			const fees = {
				baseFee: orderFeeWei,
				crossMarginFee: crossMarginFee,
				dynamicFeeRate: volatilityFeeWei,
				total: orderFeeWei.add(crossMarginFee),
			};
			setTradeFees(fees);
			return fees;
		},
		[crossMarginTradeFee, selectedAccountType, marketAsset, synthetixjs, setTradeFees]
	);

	const calculateMarginDelta = useCallback(
		async (tradeSize: TradeSize, fees: TradeFees) => {
			const currentSize = position?.position?.notionalValue || zeroBN;
			const newNotionalValue = currentSize.add(tradeSize.susdSizeDelta);
			const fullMargin = newNotionalValue.abs().div(tradeSize.leverage);
			let marginDelta = fullMargin.sub(position?.remainingMargin || '0');
			return marginDelta.add(fees.total);
		},
		[position?.position?.notionalValue, position?.remainingMargin]
	);

	// eslint-disable-next-line
	const debounceFetchPreview = useCallback(
		debounce(async (nextTradeSize: TradeSize) => {
			try {
				setError(null);
				const fees = await calculateFees(
					nextTradeSize.susdSizeDelta,
					nextTradeSize.nativeSizeDelta
				);
				let nextMarginDelta = zeroBN;
				if (selectedAccountType === 'cross_margin') {
					nextMarginDelta = await calculateMarginDelta(nextTradeSize, fees);
					setCrossMarginMarginDelta(nextMarginDelta);
				}
				getPotentialTrade(
					nextTradeSize.nativeSizeDelta,
					nextMarginDelta,
					Number(nextTradeSize.leverage)
				);
			} catch (err) {
				setError(t('futures.market.trade.preview.error'));
				logError(err);
			}
		}, 500),
		[
			logError,
			setError,
			calculateFees,
			setCrossMarginMarginDelta,
			getPotentialTrade,
			calculateMarginDelta,
			selectedAccountType,
		]
	);

	const onStagePositionChange = useCallback(
		(tradeSize: TradeSize) => {
			setTradeSize(tradeSize);
			setPendingTradeSize(null);
			debounceFetchPreview(tradeSize);
		},
		[setTradeSize, setPendingTradeSize, debounceFetchPreview]
	);

	const onTradeAmountChange = React.useCallback(
		(value: string, fromLeverage: boolean = false) => {
			const changeEnabled = remainingMargin.gt(0) && value !== '';
			const size = fromLeverage ? (value === '' ? '' : wei(value).toNumber().toString()) : value;
			const sizeSusdWei = marketAssetRate.mul(value || 0);
			const isolatedMarginLeverage = changeEnabled ? sizeSusdWei.div(remainingMargin) : zeroBN;
			const leverage =
				value === '' || remainingMargin.eq(0)
					? ''
					: selectedAccountType === 'cross_margin'
					? selectedLeverage
					: isolatedMarginLeverage;

			onStagePositionChange({
				nativeSize: size,
				susdSize: changeEnabled ? sizeSusdWei.toString() : '',
				nativeSizeDelta: size ? wei(leverageSide === PositionSide.LONG ? size : -size) : zeroBN,
				susdSizeDelta: leverageSide === PositionSide.LONG ? sizeSusdWei : sizeSusdWei.neg(),
				leverage:
					leverage !== '' && marketMaxLeverage.gt(leverage)
						? leverage.toString().substring(0, 4)
						: '',
			});
		},
		[
			marketAssetRate,
			remainingMargin,
			marketMaxLeverage,
			leverageSide,
			selectedLeverage,
			selectedAccountType,
			onStagePositionChange,
		]
	);

	const onTradeAmountSUSDChange = useCallback(
		(value: string, commitChange = true, crossMarginLeverage?: string) => {
			if (marketAssetRate.gt(0)) {
				const changeEnabled = remainingMargin.gt(0) && value !== '';
				const size = changeEnabled ? wei(value).div(marketAssetRate).toNumber().toString() : '';
				const leverage =
					selectedAccountType === 'cross_margin'
						? crossMarginLeverage || selectedLeverage
						: changeEnabled
						? wei(value).div(remainingMargin).toString().substring(0, 4)
						: '';

				const newSize = {
					nativeSize: size,
					susdSize: value,
					susdSizeDelta: value ? wei(leverageSide === PositionSide.LONG ? value : -value) : zeroBN,
					nativeSizeDelta: size ? wei(leverageSide === PositionSide.LONG ? size : -size) : zeroBN,
					leverage: leverage,
				};

				if (commitChange) {
					onStagePositionChange(newSize);
				} else {
					// Allows us to keep it snappy updating the input values
					setPendingTradeSize(newSize);
				}
			}
		},
		[
			marketAssetRate,
			remainingMargin,
			leverageSide,
			selectedLeverage,
			selectedAccountType,
			setPendingTradeSize,
			onStagePositionChange,
		]
	);

	const onChangeOpenPosLeverage = useCallback(
		async (leverage: number) => {
			const notionalValue = position?.position?.notionalValue || zeroBN;
			const adjustedMargin = notionalValue.abs().div(leverage);
			const newMargin = adjustedMargin.gt(totalMargin) ? totalMargin : adjustedMargin;

			let newUsdSize = newMargin.mul(leverage);
			newUsdSize = position?.position?.side === 'long' ? newUsdSize : newUsdSize.neg();
			const usdSizeDelta = newUsdSize.sub(notionalValue);
			const nativeSizeDelta = usdSizeDelta.div(marketAssetRate);
			const fees = await calculateFees(usdSizeDelta.abs(), nativeSizeDelta);

			// TODO: Make this size calc accurate

			const adjustedSusdDelta = usdSizeDelta.add(fees.total.mul(leverage)).mul(1.03);
			const adjustedNativeDelta = adjustedSusdDelta.div(marketAssetRate);
			debounceFetchPreview({
				leverage: String(leverage),
				nativeSize: adjustedNativeDelta.abs().toString(),
				susdSize: adjustedSusdDelta.abs().toString(),
				susdSizeDelta: adjustedSusdDelta,
				nativeSizeDelta: adjustedNativeDelta,
			});
		},
		[
			totalMargin,
			marketAssetRate,
			calculateFees,
			position?.position?.notionalValue,
			position?.position?.side,
			debounceFetchPreview,
		]
	);

	const onLeverageChange = useCallback(
		(leverage: number) => {
			if (selectedAccountType === 'cross_margin') {
				if (position?.position) {
					onChangeOpenPosLeverage(leverage);
				} else {
					onTradeAmountSUSDChange('', true, String(leverage));
				}
			} else {
				if (leverage <= 0) {
					resetTradeState();
				} else {
					const newTradeSize =
						marketAssetRate.eq(0) || remainingMargin.eq(0)
							? ''
							: wei(leverage).mul(remainingMargin).div(marketAssetRate).toString();
					onTradeAmountChange(newTradeSize, true);
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
			onTradeAmountSUSDChange,
		]
	);

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(marketAsset)}`,
		orderType === 1 ? 'submitNextPriceOrderWithTracking' : 'modifyPositionWithTracking',
		[tradeSize.nativeSizeDelta.toBN(), KWENTA_TRACKING_CODE],
		gasPrice,
		{
			enabled:
				selectedAccountType === 'isolated_margin' &&
				!!marketAsset &&
				!!tradeSize.leverage &&
				Number(tradeSize.leverage) >= 0 &&
				maxLeverage.gte(tradeSize.leverage) &&
				!tradeSize.nativeSizeDelta.eq(zeroBN),
		}
	);

	const submitCrossMarginOrder = async () => {
		if (!crossMarginAccountContract) return;
		const newPosition = [
			{
				marketKey: formatBytes32String(marketAsset),
				marginDelta: crossMarginMarginDelta.toBN(),
				sizeDelta: tradeSize.nativeSizeDelta.toBN(),
			},
		];
		return await crossMarginAccountContract.distributeMargin(newPosition);
	};

	const submitIsolatedMarginOrder = () => {
		orderTxn.mutate();
	};

	useEffect(() => {
		// Check within max
		if (wei(tradeSize.susdSize || 0).gt(maxUsdInputAmount)) {
			onTradeAmountSUSDChange(
				Math.floor(Number(maxUsdInputAmount)).toString(),
				true,
				selectedLeverage
			);
		}
	}, [maxUsdInputAmount, tradeSize.susdSize, selectedLeverage, onTradeAmountSUSDChange]);

	useEffect(() => {
		if (orderTxn.hash) {
			monitorTransaction({
				txHash: orderTxn.hash,
				onTxConfirmed: () => {
					resetTradeState();
					handleRefetch('modify-position');
				},
			});
		}
		// TODO: Wrap handleRefetch in usecallback?
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash, monitorTransaction, setTradeSize]);

	useEffect(() => {
		const getMaxFee = async () => {
			if (!synthetixjs || !marketAsset || !remainingMargin) {
				return;
			}
			try {
				const currentValue = position?.position?.notionalValue || zeroBN;
				let maxUsd = remainingMargin.mul(selectedLeverage);
				maxUsd = leverageSide === 'long' ? maxUsd.sub(currentValue) : maxUsd.add(currentValue);
				const maxSize = maxUsd.gt(0) ? maxUsd.div(marketAssetRate) : zeroBN;
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const maxOrderFee = await FuturesMarketContract.orderFee(maxSize.toBN());
				setMaxFee(wei(maxOrderFee.fee));
			} catch (e) {
				logError(e);
			}
		};
		getMaxFee();
	}, [
		synthetixjs,
		marketAsset,
		leverageSide,
		position?.position?.notionalValue,
		remainingMargin,
		marketAssetRate,
		selectedLeverage,
	]);

	return {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		resetTradeState,
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

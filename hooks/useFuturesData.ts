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
	crossMarginLeverageInputState,
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
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const [crossMarginLeverageInput, setCrossMarginLeverageInput] = useRecoilState(
		crossMarginLeverageInputState
	);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const { tradeFee: crossMarginTradeFee } = useRecoilValue(crossMarginSettingsState);
	const [selectedAccountType, setSelectedAccountType] = usePersistedRecoilState(
		futuresAccountTypeState
	);
	const [preferredLeverage] = usePersistedRecoilState(preferredLeverageState);
	const { selectedFuturesAddress, crossMarginAvailable } = useRecoilValue(futuresAccountState);
	const marketAssetRate = useRecoilValue(marketAssetRateState);

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
		return (
			crossMarginLeverageInput ||
			effectiveLeverage ||
			preferredLeverage[marketAsset] ||
			DEFAULT_LEVERAGE
		);
	}, [crossMarginLeverageInput, position?.position?.leverage, preferredLeverage, marketAsset]);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed];

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginAccount?.freeMargin || zeroBN;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginAccount?.freeMargin, selectedAccountType]);

	useEffect(() => {
		const validType = ['cross_margin', 'isolated_margin'].includes(routerAccountType);
		if (validType) {
			setSelectedAccountType(routerAccountType as FuturesAccountType);
		}
	}, [routerAccountType, setSelectedAccountType, network.id]);

	useEffect(() => {
		const handleRouteChange = () => {
			setTradeSize({
				nativeSize: '',
				susdSize: '',
				leverage: '',
				nativeSizeDelta: zeroBN,
			});
			setCrossMarginLeverageInput('');
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, setTradeSize, setCrossMarginLeverageInput]);

	const onTradeAmountChange = React.useCallback(
		(value: string, fromLeverage: boolean = false) => {
			const size = fromLeverage ? (value === '' ? '' : wei(value).toNumber().toString()) : value;
			const sizeSUSD = value === '' ? '' : marketAssetRate.mul(Number(value)).toNumber().toString();
			const leverage =
				value === '' || remainingMargin.eq(0)
					? ''
					: marketAssetRate.mul(Number(value)).div(remainingMargin);

			setTradeSize({
				nativeSize: size,
				susdSize: sizeSUSD,
				nativeSizeDelta: size ? wei(leverageSide === PositionSide.LONG ? size : -size) : zeroBN,
				leverage:
					leverage !== '' && leverage.lt(marketMaxLeverage)
						? leverage.toString().substring(0, 4)
						: '',
			});
		},
		[marketAssetRate, remainingMargin, marketMaxLeverage, leverageSide, setTradeSize]
	);

	const onTradeAmountSUSDChange = useCallback(
		(value: string, commitChange = true) => {
			if (marketAssetRate.gt(0)) {
				const valueIsNull = value === '' || Number(value) === 0;
				const size = valueIsNull ? '' : wei(value).div(marketAssetRate).toNumber().toString();
				const leverage =
					valueIsNull || remainingMargin.eq(0)
						? ''
						: wei(value).div(remainingMargin).toString().substring(0, 4);
				const newSize = {
					nativeSize: size,
					susdSize: value,
					nativeSizeDelta: size ? wei(leverageSide === PositionSide.LONG ? size : -size) : zeroBN,
					leverage: leverage,
				};

				if (commitChange) {
					setTradeSize(newSize);
					setPendingTradeSize(null);
				} else {
					// Allows us to keep it snappy updating the input values
					setPendingTradeSize(newSize);
				}
			}
		},
		[marketAssetRate, remainingMargin, leverageSide, setTradeSize, setPendingTradeSize]
	);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
		} else {
			const currentValue = position?.position?.notionalValue || zeroBN;
			let maxUsd = remainingMargin.mul(selectedLeverage);
			maxUsd = leverageSide === 'long' ? maxUsd.sub(currentValue) : maxUsd.add(currentValue);
			const maxCrossMarginFee = maxUsd.mul(crossMarginTradeFee);
			const fees = maxFee.add(maxCrossMarginFee) || zeroBN;
			maxUsd = maxUsd.sub(fees);
			const buffer = maxUsd.mul(0.03);
			return maxUsd.abs().sub(buffer);
		}
	}, [
		position?.position?.notionalValue,
		leverageSide,
		selectedLeverage,
		maxLeverage,
		remainingMargin,
		selectedAccountType,
		crossMarginTradeFee,
		maxFee,
	]);

	const calculateFees = useCallback(
		async (tradeSize: TradeSize) => {
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
				FuturesMarketContract.orderFee(tradeSize.nativeSizeDelta.toBN()),
			]);
			const crossMarginFee =
				selectedAccountType === 'isolated_margin'
					? wei(tradeSize.susdSize || '0').mul(crossMarginTradeFee)
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
			// Update margin requirement for cross margin
			// but only when user has edited leverage if they already have a position open
			if (
				(!Number(tradeSize.susdSize) && !crossMarginLeverageInput) ||
				selectedAccountType !== 'cross_margin'
			)
				return zeroBN;

			const weiSizeUsd = wei(tradeSize.susdSize || 0);
			const sizeDeltaUsd = leverageSide === 'long' ? weiSizeUsd : weiSizeUsd.neg();
			const currentSize = position?.position?.notionalValue || zeroBN;
			const newNotionalValue = currentSize.add(sizeDeltaUsd);

			const fullMargin = newNotionalValue.abs().div(selectedLeverage);
			let marginDelta = fullMargin.sub(position?.remainingMargin || '0');
			return marginDelta.add(fees.total);
		},
		[
			selectedLeverage,
			crossMarginLeverageInput,
			leverageSide,
			position?.position?.notionalValue,
			position?.remainingMargin,
			selectedAccountType,
		]
	);

	useEffect(() => {
		// Set to max when leverage or leverage side changes
		if (wei(tradeSize.susdSize || 0).gt(maxUsdInputAmount)) {
			const amount = wei(Math.min(Number(tradeSize.susdSize), Number(maxUsdInputAmount)));
			onTradeAmountSUSDChange(Number(amount).toFixed(0));
		}
	}, [maxUsdInputAmount, tradeSize.susdSize, onTradeAmountSUSDChange]);

	// eslint-disable-next-line
	const debounceFetchPreview = useCallback(
		debounce(async (nextTradeSize: TradeSize) => {
			try {
				setError(null);
				const fees = await calculateFees(nextTradeSize);
				let nextMarginDelta = zeroBN;
				if (selectedAccountType === 'cross_margin') {
					nextMarginDelta = await calculateMarginDelta(nextTradeSize, fees);
					setCrossMarginMarginDelta(nextMarginDelta);
				}
				getPotentialTrade(wei(nextTradeSize.nativeSize || '0'), nextMarginDelta);
			} catch (err) {
				setError(t('futures.market.trade.preview.error'));
				logError(err);
			}
		}, 500),
		[logError, setError, calculateFees, setCrossMarginMarginDelta, getPotentialTrade]
	);

	useEffect(() => {
		debounceFetchPreview(tradeSize);
	}, [tradeSize, debounceFetchPreview]);

	const onLeverageChange = useCallback(
		(value: string) => {
			if (value === '' || Number(value) <= 0) {
				setTradeSize({
					nativeSize: '',
					susdSize: '',
					nativeSizeDelta: zeroBN,
					leverage: Number(value) === 0 ? value.substring(0, 4) : '',
				});
			} else {
				const newTradeSize = marketAssetRate.eq(0)
					? 0
					: wei(value).mul(remainingMargin).div(marketAssetRate);
				onTradeAmountChange(newTradeSize.toString(), true);
			}
		},
		[remainingMargin, marketAssetRate, onTradeAmountChange, setTradeSize]
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
				maxLeverageValue.gte(tradeSize.leverage) &&
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
		if (orderTxn.hash) {
			monitorTransaction({
				txHash: orderTxn.hash,
				onTxConfirmed: () => {
					onLeverageChange('');
					handleRefetch('modify-position');
				},
			});
		}
	}, [orderTxn.hash, monitorTransaction, handleRefetch, onLeverageChange]);

	useEffect(() => {
		const getMaxFee = async () => {
			if (!synthetixjs || !marketAsset || !remainingMargin) {
				return;
			}
			try {
				const maxSize = marketAssetRate.gt(0)
					? remainingMargin.mul(selectedLeverage).div(marketAssetRate)
					: zeroBN;
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
		selectedFuturesAddress,
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
		marketAssetRate,
		position,
		marketAsset,
		market,
		orderTxn,
		maxUsdInputAmount,
		tradeFees,
		selectedLeverage,
		error,
	};
};

export default useFuturesData;

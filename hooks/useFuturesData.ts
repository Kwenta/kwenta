import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { FuturesAccountType } from 'queries/futures/types';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import { getFuturesMarketContract } from 'queries/futures/utils';
import {
	crossMarginLeverageInputState,
	crossMarginMarginDeltaState,
	currentMarketState,
	feeCostState,
	futuresAccountState,
	leverageSideState,
	isolatedMarginleverageState,
	leverageValueCommittedState,
	marketAssetRateState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	sizeDeltaState,
	tradeSizeState,
	tradeSizeSUSDState,
	crossMarginSettingsState,
	futuresAccountTypeState,
	preferredLeverageState,
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

	const marketAsset = useRecoilValue(currentMarketState);
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [leverage, setLeverage] = useRecoilState(isolatedMarginleverageState);
	const [_tradeSize, setTradeSize] = useRecoilState(tradeSizeState);
	const [crossMarginMarginDelta, setCrossMarginMarginDelta] = useRecoilState(
		crossMarginMarginDeltaState
	);
	const [tradeSizeSUSD, setTradeSizeSUSD] = useRecoilState(tradeSizeSUSDState);
	const [feeCost, setFeeCost] = useRecoilState(feeCostState);
	const leverageSide = useRecoilValue(leverageSideState);
	const orderType = useRecoilValue(orderTypeState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const isLeverageValueCommitted = useRecoilValue(leverageValueCommittedState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const crossMarginLeverageInput = useRecoilValue(crossMarginLeverageInputState);
	const maxLeverage = useRecoilValue(maxLeverageState);
	const { tradeFee: crossMarginTradeFee } = useRecoilValue(crossMarginSettingsState);
	const [selectedAccountType, setSelectedAccountType] = usePersistedRecoilState(
		futuresAccountTypeState
	);
	const [preferredLeverage] = usePersistedRecoilState(preferredLeverageState);
	const { selectedFuturesAddress, crossMarginAvailable } = useRecoilValue(futuresAccountState);

	// TODO: default based on selected chain
	const routerAccountType =
		typeof router.query.accountType === 'string' ? router.query.accountType : 'cross_margin';

	const [dynamicFee, setDynamicFee] = useState<Wei | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [maxFee, setMaxFee] = useState(zeroBN);

	const crossMarginAccount = crossMarginAvailable
		? { freeMargin: crossMarginAccountOverview.data?.freeMargin }
		: null;

	const marketAssetRate = useRecoilValue(marketAssetRateState);

	const positionLeverage = position?.position?.leverage ?? wei(0);
	const positionSide = position?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const effectiveLeverage = position?.position?.leverage.toString() || '';
	const selectedLeverage = crossMarginLeverageInput || effectiveLeverage || preferredLeverage;

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
			setTradeSize('');
			setTradeSizeSUSD('');
			setLeverage('');
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, setTradeSize, setTradeSizeSUSD, setLeverage]);

	const onTradeAmountChange = React.useCallback(
		(value: string, fromLeverage: boolean = false) => {
			const size = fromLeverage ? (value === '' ? '' : wei(value).toNumber().toString()) : value;
			const sizeSUSD = value === '' ? '' : marketAssetRate.mul(Number(value)).toNumber().toString();
			const leverage =
				value === '' || remainingMargin.eq(0)
					? ''
					: marketAssetRate.mul(Number(value)).div(remainingMargin);
			setTradeSize(size);
			setTradeSizeSUSD(sizeSUSD);
			setLeverage(
				leverage !== '' && leverage.lt(marketMaxLeverage) ? leverage.toString().substring(0, 4) : ''
			);
		},
		[
			marketAssetRate,
			remainingMargin,
			marketMaxLeverage,
			setTradeSize,
			setTradeSizeSUSD,
			setLeverage,
		]
	);

	const onTradeAmountSUSDChange = useCallback(
		(value: string) => {
			if (marketAssetRate.gt(0)) {
				const valueIsNull = value === '' || Number(value) === 0;
				const size = valueIsNull ? '' : wei(value).div(marketAssetRate).toNumber().toString();
				const leverage =
					valueIsNull || remainingMargin.eq(0)
						? ''
						: wei(value).div(remainingMargin).toString().substring(0, 4);
				setTradeSizeSUSD(value);
				setTradeSize(size);
				setLeverage(leverage);
			}
		},
		[marketAssetRate, remainingMargin, setTradeSizeSUSD, setTradeSize, setLeverage]
	);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
		} else {
			const currentValue = position?.position?.notionalValue || zeroBN;
			let maxUsd = remainingMargin.mul(selectedLeverage);
			maxUsd = leverageSide === 'long' ? maxUsd.sub(currentValue) : maxUsd.add(currentValue);
			const maxCrossMarginFee = maxUsd.mul(crossMarginTradeFee);
			const fees = maxFee.add(dynamicFee || '0').add(maxCrossMarginFee) || zeroBN;
			maxUsd = maxUsd.sub(fees);
			const buffer = maxUsd.mul(0.03);
			return maxUsd.abs().sub(buffer);
		}
	}, [
		dynamicFee,
		position?.position?.notionalValue,
		leverageSide,
		selectedLeverage,
		maxLeverage,
		remainingMargin,
		selectedAccountType,
		crossMarginTradeFee,
		maxFee,
	]);

	const tradeFees = useMemo(() => {
		const base = {
			baseFee: feeCost,
			dynamicFee,
		};
		if (selectedAccountType === 'isolated_margin')
			return {
				...base,
				crossMarginFee: zeroBN,
				total: zeroBN,
			};

		const crossMarginFee = wei(tradeSizeSUSD || '0').mul(crossMarginTradeFee);

		return {
			...base,
			crossMarginFee: crossMarginFee,
			total: crossMarginFee.add(feeCost || 0).add(dynamicFee || 0),
		};
	}, [selectedAccountType, tradeSizeSUSD, crossMarginTradeFee, feeCost, dynamicFee]);

	useEffect(() => {
		// Set to max when leverage or leverage side changes
		if (wei(tradeSizeSUSD || 0).gt(maxUsdInputAmount)) {
			const amount = wei(Math.min(Number(tradeSizeSUSD), Number(maxUsdInputAmount)));
			onTradeAmountSUSDChange(Number(amount).toFixed(0));
		}
	}, [maxUsdInputAmount, tradeSizeSUSD, onTradeAmountSUSDChange]);

	useEffect(() => {
		// Update margin requirement for cross margin
		// but only when user has edited leverage if they already have a position open
		if (!tradeSizeSUSD && position?.position && !crossMarginLeverageInput) return;
		const weiSizeUsd = wei(tradeSizeSUSD || 0);
		const sizeDeltaUsd = leverageSide === 'long' ? weiSizeUsd : weiSizeUsd.neg();
		const currentSize = position?.position?.notionalValue || zeroBN;
		const newNotionalValue = currentSize.add(sizeDeltaUsd);

		const fullMargin = newNotionalValue.abs().div(selectedLeverage);
		let marginDelta = fullMargin.sub(position?.remainingMargin || '0');
		marginDelta = marginDelta.add(tradeFees.total);
		setCrossMarginMarginDelta(marginDelta);
	}, [
		tradeSizeSUSD,
		selectedLeverage,
		crossMarginLeverageInput,
		tradeFees.total,
		leverageSide,
		position?.position,
		position?.position?.notionalValue,
		position?.remainingMargin,
		setCrossMarginMarginDelta,
	]);

	const onLeverageChange = useCallback(
		(value: string) => {
			if (value === '' || Number(value) <= 0) {
				setTradeSize('');
				setTradeSizeSUSD('');
				setLeverage(Number(value) === 0 ? value.substring(0, 4) : '');
			} else {
				const newTradeSize = marketAssetRate.eq(0)
					? 0
					: wei(value).mul(remainingMargin).div(marketAssetRate);
				onTradeAmountChange(newTradeSize.toString(), true);
				setLeverage(value.substring(0, 4));
			}
		},
		[
			remainingMargin,
			marketAssetRate,
			onTradeAmountChange,
			setTradeSize,
			setTradeSizeSUSD,
			setLeverage,
		]
	);

	const orderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(marketAsset)}`,
		orderType === 1 ? 'submitNextPriceOrderWithTracking' : 'modifyPositionWithTracking',
		[sizeDelta.toBN(), KWENTA_TRACKING_CODE],
		gasPrice,
		{
			enabled:
				selectedAccountType === 'isolated_margin' &&
				!!marketAsset &&
				!!leverage &&
				Number(leverage) >= 0 &&
				maxLeverageValue.gte(leverage) &&
				!sizeDelta.eq(zeroBN),
		}
	);

	const submitCrossMarginOrder = async () => {
		if (!crossMarginAccountContract) return;
		const newPosition = [
			{
				marketKey: formatBytes32String(marketAsset),
				marginDelta: crossMarginMarginDelta.toBN(),
				sizeDelta: sizeDelta.toBN(),
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

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderTxn.hash]);

	useEffect(() => {
		const getOrderFee = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!selectedFuturesAddress ||
				!isLeverageValueCommitted ||
				!remainingMargin
			) {
				return;
			}
			try {
				setError(null);
				const maxSize = marketAssetRate.gt(0)
					? remainingMargin.mul(selectedLeverage).div(marketAssetRate)
					: zeroBN;
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const [volatilityFee, orderFee, maxOrderFee] = await Promise.all([
					synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
						ethers.utils.formatBytes32String('sUSD'),
						ethers.utils.formatBytes32String(marketAsset)
					),
					FuturesMarketContract.orderFee(sizeDelta.toBN()),
					FuturesMarketContract.orderFee(maxSize.toBN()),
				]);
				setDynamicFee(wei(volatilityFee.feeRate));
				setFeeCost(wei(orderFee.fee));
				setMaxFee(wei(maxOrderFee.fee));
			} catch (e) {
				logError(e);
				// @ts-ignore
				setError(e?.data?.message ?? e.message);
			}
		};
		getOrderFee();
	}, [
		synthetixjs,
		marketAsset,
		selectedFuturesAddress,
		isLeverageValueCommitted,
		sizeDelta,
		remainingMargin,
		marketAssetRate,
		selectedLeverage,
		setFeeCost,
	]);

	const previewTrade = useRecoilValue(potentialTradeDetailsState);

	return {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		submitIsolatedMarginOrder,
		submitCrossMarginOrder,
		remainingMargin,
		crossMarginAccount,
		marketAssetRate,
		maxLeverageValue,
		position,
		positionLeverage,
		positionSide,
		error,
		dynamicFee,
		marketAsset,
		market,
		orderTxn,
		previewTrade,
		maxUsdInputAmount,
		tradeFees,
		selectedAccountType,
		selectedLeverage,
	};
};

export default useFuturesData;

import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { CROSS_MARGIN_ENABLED, DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { FuturesAccountType } from 'queries/futures/types';
import { serializeGasPrice } from 'state/app/helpers';
import { setGasPrice } from 'state/app/reducer';
import { selectGasSpeed } from 'state/app/selectors';
import { clearTradeInputs, fetchDynamicFeeRate } from 'state/futures/actions';
import { usePollMarketFuturesData } from 'state/futures/hooks';
import { setFuturesAccountType } from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectCrossMarginAccount,
	selectPosition,
	selectMaxLeverage,
	selectAboveMaxLeverage,
	selectCrossMarginSettings,
	selectCrossMarginOrderPrice,
	selectCrossMarginSelectedLeverage,
	selectFuturesType,
	selectLeverageSide,
	selectOrderType,
	selectIsAdvancedOrder,
	selectCrossMarginTradeFees,
	selectDynamicFeeRate,
	selectSkewAdjustedPrice,
} from 'state/futures/selectors';
import { selectMarketAsset, selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector, useAppDispatch } from 'state/hooks';
import { computeMarketFee } from 'utils/costCalculations';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

const useFuturesData = () => {
	const router = useRouter();
	usePollMarketFuturesData();
	const dispatch = useAppDispatch();
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);

	const crossMarginBalanceInfo = useAppSelector(selectCrossMarginBalanceInfo);

	const gasSpeed = useAppSelector(selectGasSpeed);

	// TODO: Move to sdk and redux
	const { useEthGasPriceQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();

	useEffect(() => {
		const price = ethGasPriceQuery.data?.[gasSpeed];
		if (price) {
			dispatch(setGasPrice(serializeGasPrice(price)));
		}
	}, [ethGasPriceQuery.data, gasSpeed, dispatch]);

	const marketAsset = useAppSelector(selectMarketAsset);

	const tradeFees = useAppSelector(selectCrossMarginTradeFees);
	const dynamicFeeRate = useAppSelector(selectDynamicFeeRate);
	const leverageSide = useAppSelector(selectLeverageSide);
	const orderType = useAppSelector(selectOrderType);
	const position = useAppSelector(selectPosition);
	const aboveMaxLeverage = useAppSelector(selectAboveMaxLeverage);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const selectedLeverage = useAppSelector(selectCrossMarginSelectedLeverage);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const marketPrice = useAppSelector(selectSkewAdjustedPrice);

	const { tradeFee: crossMarginTradeFee, stopOrderFee, limitOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);
	const isAdvancedOrder = useAppSelector(selectIsAdvancedOrder);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const market = useAppSelector(selectMarketInfo);

	const [maxFee, setMaxFee] = useState(zeroBN);

	const tradePrice = useMemo(() => wei(isAdvancedOrder ? orderPrice || zeroBN : marketPrice), [
		orderPrice,
		marketPrice,
		isAdvancedOrder,
	]);

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginBalanceInfo.freeMargin;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginBalanceInfo.freeMargin, selectedAccountType]);

	const resetTradeState = useCallback(() => {
		dispatch(clearTradeInputs());
	}, [dispatch]);

	const maxUsdInputAmount = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return maxLeverage.mul(remainingMargin);
		}
		if (aboveMaxLeverage && position?.position?.side === leverageSide) {
			return zeroBN;
		}

		const totalMargin =
			position?.position?.side === leverageSide
				? crossMarginBalanceInfo.freeMargin
				: crossMarginBalanceInfo.freeMargin.add(position?.remainingMargin ?? zeroBN);

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
		crossMarginBalanceInfo.freeMargin,
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

	const totalFeeRate = useCallback(
		(usdSizeDelta: Wei) => {
			const staticRate = computeMarketFee(market, usdSizeDelta);

			let total = crossMarginTradeFee.add(dynamicFeeRate).add(staticRate).add(advancedOrderFeeRate);

			return total;
		},
		[market, crossMarginTradeFee, dynamicFeeRate, advancedOrderFeeRate]
	);

	useEffect(() => {
		const getMaxFee = () => {
			if (remainingMargin.eq(0) || tradePrice.eq(0)) {
				return;
			}
			try {
				const totalMargin =
					position?.position?.side === leverageSide
						? crossMarginBalanceInfo.freeMargin
						: crossMarginBalanceInfo.freeMargin.add(position?.remainingMargin ?? zeroBN);

				let maxUsd = totalMargin.mul(selectedLeverage);
				if (position?.position?.side !== leverageSide) {
					maxUsd = maxUsd.add(position?.position?.notionalValue ?? zeroBN);
				}
				const totalRate = totalFeeRate(maxUsd);
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
		crossMarginBalanceInfo.freeMargin,
		tradePrice,
		selectedLeverage,
	]);

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
		resetTradeState();
		// Clear trade state when switching address
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [crossMarginAddress]);

	useEffect(() => {
		if (!CROSS_MARGIN_ENABLED) {
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
		dispatch(setFuturesAccountType(accountType));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, router.query.accountType]);

	useEffect(() => {
		const getDynamicFee = async () => {
			dispatch(fetchDynamicFeeRate());
		};
		getDynamicFee();
	}, [marketAsset, orderPrice, dispatch]);

	return {
		resetTradeState,
		position,
		market,
		maxUsdInputAmount,
		tradeFees,
		selectedLeverage,
		tradePrice,
	};
};

export default useFuturesData;

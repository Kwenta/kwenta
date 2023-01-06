import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { CROSS_MARGIN_ENABLED, DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { CROSS_MARGIN_ORDER_TYPES, ISOLATED_MARGIN_ORDER_TYPES } from 'constants/futures';
import Connector from 'containers/Connector';
import { FuturesAccountType } from 'queries/futures/types';
import { serializeGasPrice } from 'state/app/helpers';
import { setGasPrice } from 'state/app/reducer';
import { selectGasSpeed } from 'state/app/selectors';
import { clearTradeInputs, editTradeSizeInput } from 'state/futures/actions';
import { usePollMarketFuturesData } from 'state/futures/hooks';
import {
	setDynamicFeeRate as setDynamicFeeRateRedux,
	setFuturesAccountType,
	setOrderType,
} from 'state/futures/reducer';
import {
	selectCrossMarginBalanceInfo,
	selectCrossMarginAccount,
	selectMarketAssetRate,
	selectPosition,
	selectMaxLeverage,
	selectAboveMaxLeverage,
	selectCrossMarginSettings,
	selectTradeSizeInputs,
	selectCrossMarginOrderPrice,
	selectCrossMarginSelectedLeverage,
	selectFuturesType,
	selectLeverageSide,
	selectOrderType,
	selectIsAdvancedOrder,
	selectCrossMarginTradeFees,
	selectDynamicFeeRate,
	selectCrossMarginMarginDelta,
} from 'state/futures/selectors';
import { selectMarketAsset, selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector, useAppDispatch } from 'state/hooks';
import { futuresAccountState, orderFeeCapState } from 'store/futures';
import { computeMarketFee } from 'utils/costCalculations';
import { zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from './useCrossMarginContracts';

const useFuturesData = () => {
	const router = useRouter();
	const { defaultSynthetixjs: synthetixjs, network } = Connector.useContainer();
	const { crossMarginAvailable } = useRecoilValue(futuresAccountState);
	usePollMarketFuturesData();
	const dispatch = useAppDispatch();
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);

	const crossMarginBalanceInfo = useAppSelector(selectCrossMarginBalanceInfo);
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();

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

	const crossMarginMarginDelta = useAppSelector(selectCrossMarginMarginDelta);
	const tradeFees = useAppSelector(selectCrossMarginTradeFees);
	const dynamicFeeRate = useAppSelector(selectDynamicFeeRate);
	const leverageSide = useAppSelector(selectLeverageSide);
	const orderType = useAppSelector(selectOrderType);
	const feeCap = useRecoilValue(orderFeeCapState);
	const position = useAppSelector(selectPosition);
	const aboveMaxLeverage = useAppSelector(selectAboveMaxLeverage);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const tradeSizeInputs = useAppSelector(selectTradeSizeInputs);
	const selectedLeverage = useAppSelector(selectCrossMarginSelectedLeverage);
	const selectedAccountType = useAppSelector(selectFuturesType);

	const { tradeFee: crossMarginTradeFee, stopOrderFee, limitOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);

	const isAdvancedOrder = useAppSelector(selectIsAdvancedOrder);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const market = useAppSelector(selectMarketInfo);

	const [maxFee, setMaxFee] = useState(zeroBN);

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

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginAccount?.freeMargin || zeroBN;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginAccount?.freeMargin, selectedAccountType]);

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

	const totalFeeRate = useCallback(
		async (sizeDelta: Wei) => {
			const staticRate = computeMarketFee(market, sizeDelta);

			let total = crossMarginTradeFee.add(dynamicFeeRate).add(staticRate).add(advancedOrderFeeRate);

			return total;
		},
		[market, crossMarginTradeFee, dynamicFeeRate, advancedOrderFeeRate]
	);

	const submitCrossMarginOrder = useCallback(
		async (fromEditLeverage?: boolean, gasLimit?: Wei | null) => {
			if (!crossMarginAccountContract) return;
			if (orderType === 'market' || fromEditLeverage) {
				const newPosition = [
					{
						marketKey: formatBytes32String(MarketKeyByAsset[marketAsset]),
						marginDelta: crossMarginMarginDelta.toBN(),
						sizeDelta: tradeSizeInputs.nativeSizeDelta.toBN(),
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
				tradeSizeInputs.nativeSizeDelta.toBN(),
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
			tradeSizeInputs.nativeSizeDelta,
			tradeFees.keeperEthDeposit,
		]
	);

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
			dispatch(setOrderType('market'));
		} else if (
			selectedAccountType === 'isolated_margin' &&
			!ISOLATED_MARGIN_ORDER_TYPES.includes(orderType)
		) {
			dispatch(setOrderType('market'));
		}
		editTradeSizeInput(tradeSizeInputs.susdSizeString, 'usd');

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
		if (tradeSizeInputs.susdSizeDelta.eq(0)) return;
		editTradeSizeInput(tradeSizeInputs.susdSizeString, 'usd');
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

	const priceString = marketAssetRate.toString();

	useEffect(() => {
		const getDynamicFee = async () => {
			if (!synthetixjs) return;
			// TODO: Move to sdk
			const dynamicFeeRate = await synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
				ethers.utils.formatBytes32String('sUSD'),
				ethers.utils.formatBytes32String(marketAsset)
			);
			dispatch(setDynamicFeeRateRedux(wei(dynamicFeeRate.feeRate).toString()));
		};
		getDynamicFee();
	}, [marketAsset, priceString, synthetixjs, dispatch]);

	return {
		submitCrossMarginOrder,
		resetTradeState,
		marketAssetRate,
		position,
		market,
		maxUsdInputAmount,
		tradeFees,
		selectedLeverage,
		tradePrice,
	};
};

export default useFuturesData;

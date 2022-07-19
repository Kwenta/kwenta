import React, { useState, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';

import { gasSpeedState } from 'store/wallet';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import Connector from 'containers/Connector';
import { Synths } from 'constants/currency';
import useGetFuturesMarketLimit from 'queries/futures/useGetFuturesMarketLimit';
import {
	currentMarketState,
	feeCostState,
	futuresAccountState,
	leverageSideState,
	leverageState,
	leverageValueCommittedState,
	marketInfoState,
	marketKeyState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	sizeDeltaState,
	tradeSizeState,
	tradeSizeSUSDState,
} from 'store/futures';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { PositionSide } from 'sections/futures/types';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { zeroBN } from 'utils/formatters/number';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';

const DEFAULT_MAX_LEVERAGE = wei(10);

const useFuturesData = () => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const router = useRouter();
	const { synthetixjs } = Connector.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();

	const marketAsset = useRecoilValue(currentMarketState);
	const marketKey = useRecoilValue(marketKeyState);
	const marketLimitQuery = useGetFuturesMarketLimit(marketKey);

	const ethGasPriceQuery = useEthGasPriceQuery();

	const [leverage, setLeverage] = useRecoilState(leverageState);
	const [tradeSize, setTradeSize] = useRecoilState(tradeSizeState);
	const [, setTradeSizeSUSD] = useRecoilState(tradeSizeSUSDState);
	const [, setFeeCost] = useRecoilState(feeCostState);
	const leverageSide = useRecoilValue(leverageSideState);
	const orderType = useRecoilValue(orderTypeState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const isLeverageValueCommitted = useRecoilValue(leverageValueCommittedState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const [dynamicFee, setDynamicFee] = useState<Wei | null>(null);
	const [error, setError] = useState<string | null>(null);

	const exchangeRates = useMemo(() => exchangeRatesQuery.data ?? null, [exchangeRatesQuery.data]);

	const marketAssetRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, marketKey, Synths.sUSD),
		[exchangeRates, marketKey]
	);

	const positionLeverage = position?.position?.leverage ?? wei(0);
	const positionSide = position?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const maxMarketValueUSD = marketLimitQuery?.data ?? wei(0);
	const marketSize = market?.marketSize ?? wei(0);
	const marketSkew = market?.marketSkew ?? wei(0);

	const gasPrice = ethGasPriceQuery?.data?.[gasSpeed];

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
				value === '' || !position?.remainingMargin
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
		[marketAssetRate, position?.remainingMargin, setTradeSize, setTradeSizeSUSD, setLeverage]
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
	}, [router.events, setTradeSize, setTradeSizeSUSD, setLeverage]);

	const onTradeAmountSUSDChange = (value: string) => {
		const valueIsNull = value === '' || Number(value) === 0;
		if (marketAssetRate.gt(0)) {
			const size = valueIsNull ? '' : wei(value).div(marketAssetRate).toNumber().toString();
			const leverage = valueIsNull
				? ''
				: wei(value).div(position?.remainingMargin).toString().substring(0, 4);
			setTradeSizeSUSD(value);
			setTradeSize(size);
			setLeverage(leverage);
		}
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
		[
			position?.remainingMargin,
			marketAssetRate,
			onTradeAmountChange,
			setTradeSize,
			setTradeSizeSUSD,
			setLeverage,
		]
	);

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
				maxLeverageValue.gte(leverage) &&
				!sizeDelta.eq(zeroBN),
		}
	);

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

	const placeOrderTranslationKey = React.useMemo(() => {
		if (orderType === 1) return 'futures.market.trade.button.place-next-price-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return !position?.remainingMargin || position.remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	}, [position, orderType, isMarketCapReached]);

	useEffect(() => {
		const getOrderFee = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!selectedFuturesAddress ||
				!tradeSize ||
				Number(tradeSize) === 0 ||
				!isLeverageValueCommitted ||
				!position?.remainingMargin
			) {
				return;
			}
			try {
				setError(null);
				const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
				const [volatilityFee, orderFee] = await Promise.all([
					synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
						ethers.utils.formatBytes32String('sUSD'),
						ethers.utils.formatBytes32String(marketAsset)
					),
					FuturesMarketContract.orderFee(sizeDelta.toBN()),
				]);
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
		selectedFuturesAddress,
		isLeverageValueCommitted,
		sizeDelta,
		setFeeCost,
	]);

	const previewTrade = useRecoilValue(potentialTradeDetailsState);

	return {
		onLeverageChange,
		onTradeAmountChange,
		onTradeAmountSUSDChange,
		marketAssetRate,
		maxLeverageValue,
		position,
		placeOrderTranslationKey,
		positionLeverage,
		positionSide,
		marketMaxLeverage,
		error,
		dynamicFee,
		isMarketCapReached,
		marketAsset,
		market,
		orderTxn,
		previewTrade,
	};
};

export default useFuturesData;

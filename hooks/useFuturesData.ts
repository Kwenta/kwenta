import React, { useState, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { walletAddressState } from 'store/wallet';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import Connector from 'containers/Connector';
import { getMarketKey } from 'utils/futures';
import { Synths } from 'constants/currency';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesMarketLimit from 'queries/futures/useGetFuturesMarketLimit';
import {
	currentMarketState,
	feeCostState,
	leverageSideState,
	leverageState,
	leverageValueCommitedState,
	orderTypeState,
	positionState,
	sizeDeltaState,
	tradeSizeState,
	tradeSizeSUSDState,
} from 'store/futures';
import Wei, { wei } from '@synthetixio/wei';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { PositionSide } from 'sections/futures/types';
import { ethers } from 'ethers';
import { getFuturesMarketContract } from 'queries/futures/utils';
import { zeroBN } from 'utils/formatters/number';
import useFuturesMarketClosed from './useFuturesMarketClosed';

const DEFAULT_MAX_LEVERAGE = wei(10);

const useFuturesData = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const router = useRouter();
	const { synthetixjs, network } = Connector.useContainer();

	const marketAsset = useRecoilValue(currentMarketState);
	const marketQuery = useGetFuturesMarkets();
	const market = marketQuery?.data?.find(({ asset }) => asset === marketAsset);
	const marketLimitQuery = useGetFuturesMarketLimit(getMarketKey(marketAsset, network.id));

	const [leverage, setLeverage] = useRecoilState(leverageState);
	const [tradeSize, setTradeSize] = useRecoilState(tradeSizeState);
	const [, setTradeSizeSUSD] = useRecoilState(tradeSizeSUSDState);
	const [, setFeeCost] = useRecoilState(feeCostState);
	const leverageSide = useRecoilValue(leverageSideState);
	const orderType = useRecoilValue(orderTypeState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const isLeverageValueCommitted = useRecoilValue(leverageValueCommitedState);

	const [dynamicFee, setDynamicFee] = useState<Wei | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketAsset);

	const exchangeRates = useMemo(() => exchangeRatesQuery.data ?? null, [exchangeRatesQuery.data]);

	const marketAssetRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	const position = useRecoilValue(positionState);

	const positionLeverage = position?.position?.leverage ?? wei(0);
	const positionSide = position?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const maxLeverageValue = useMemo(() => {
		if (!positionLeverage || positionLeverage.eq(wei(0))) return marketMaxLeverage;
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
		[
			position?.remainingMargin,
			marketAssetRate,
			onTradeAmountChange,
			setTradeSize,
			setTradeSizeSUSD,
			setLeverage,
		]
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

	useEffect(() => {
		const getOrderFee = async () => {
			if (
				!synthetixjs ||
				!marketAsset ||
				!walletAddress ||
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
						ethers.utils.formatBytes32String(marketAsset as string)
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
		walletAddress,
		isLeverageValueCommitted,
		sizeDelta,
		setFeeCost,
	]);

	const shouldDisplayNextPriceDisclaimer = React.useMemo(
		() =>
			wei(leverage || 0).gte(maxLeverageValue.sub(wei(1))) &&
			wei(leverage || 0).lte(maxLeverageValue),
		[leverage, maxLeverageValue]
	);

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
		shouldDisplayNextPriceDisclaimer,
		isFuturesMarketClosed,
		marketAsset,
		marketQuery,
		market,
	};
};

export default useFuturesData;

import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import { getFuturesMarketContract } from 'queries/futures/utils';
import {
	crossMarginAvailableMarginState,
	currentMarketState,
	feeCostState,
	futuresAccountState,
	leverageSideState,
	leverageState,
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
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from './useCrossMarginContracts';

const DEFAULT_MAX_LEVERAGE = wei(10);

const useFuturesData = () => {
	const router = useRouter();
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const { useSynthetixTxn } = useSynthetixQueries();

	const marketAsset = useRecoilValue(currentMarketState);
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();

	const [leverage, setLeverage] = useRecoilState(leverageState);
	const [tradeSize, setTradeSize] = useRecoilState(tradeSizeState);
	const setTradeSizeSUSD = useSetRecoilState(tradeSizeSUSDState);
	const setFeeCost = useSetRecoilState(feeCostState);
	const leverageSide = useRecoilValue(leverageSideState);
	const orderType = useRecoilValue(orderTypeState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const isLeverageValueCommitted = useRecoilValue(leverageValueCommittedState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const market = useRecoilValue(marketInfoState);

	const { selectedFuturesAddress, crossMarginAvailable, selectedAccountType } = useRecoilValue(
		futuresAccountState
	);
	const crossMarginFreeMargin = useRecoilValue(crossMarginAvailableMarginState);

	const [dynamicFee, setDynamicFee] = useState<Wei | null>(null);
	const [error, setError] = useState<string | null>(null);

	const crossMarginAccount = crossMarginAvailable
		? { freeMargin: crossMarginAccountOverview.data?.freeMargin }
		: null;

	const marketAssetRate = useRecoilValue(marketAssetRateState);

	const positionLeverage = position?.position?.leverage ?? wei(0);
	const positionSide = position?.position?.side;
	const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

	const remainingMargin: Wei = useMemo(() => {
		if (selectedAccountType === 'isolated_margin') {
			return position?.remainingMargin || zeroBN;
		}
		const positionMargin = position?.remainingMargin || zeroBN;
		const accountMargin = crossMarginAccount?.freeMargin || zeroBN;
		return positionMargin.add(accountMargin);
	}, [position?.remainingMargin, crossMarginAccount?.freeMargin, selectedAccountType]);

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
			const leverage =
				valueIsNull || remainingMargin.eq(0)
					? ''
					: wei(value).div(remainingMargin).toString().substring(0, 4);
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
		{},
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

		// TODO: Properly assign margin when we have new designs.
		// Temporarily using all free margin (minus fees buffer) for testing.

		const margin = crossMarginFreeMargin.toBN().sub(wei('10').toBN());

		const newPosition = [
			{
				marketKey: formatBytes32String(marketAsset),
				marginDelta: margin,
				sizeDelta: wei(tradeSize).toBN(),
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
				logError(e);
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
		remainingMargin,
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
	};
};

export default useFuturesData;

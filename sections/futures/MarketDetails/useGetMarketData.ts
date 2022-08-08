import { wei } from '@synthetixio/wei';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { Period, PERIOD_IN_SECONDS } from 'constants/period';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetAverageFundingRateForMarket from 'queries/futures/useGetAverageFundingRateForMarket';
import useGetFuturesDailyTradeStatsForMarket from 'queries/futures/useGetFuturesDailyTrades';
import useGetFuturesTradingVolume from 'queries/futures/useGetFuturesTradingVolume';
import useExternalPriceQuery from 'queries/rates/useExternalPriceQuery';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { currentMarketState, marketInfoState, marketKeyState } from 'store/futures';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { isEurForex } from 'utils/futures';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const useGetMarketData = (mobile?: boolean) => {
	const marketAsset = useRecoilValue(currentMarketState);
	const marketKey = useRecoilValue(marketKeyState);
	const marketInfo = useRecoilValue(marketInfoState);

	const futuresTradingVolumeQuery = useGetFuturesTradingVolume(marketAsset);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const fundingRateQuery = useGetAverageFundingRateForMarket(PERIOD_IN_SECONDS[Period.ONE_HOUR]);
	const avgFundingRate = fundingRateQuery?.data ?? null;

	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const futuresDailyTradeStatsQuery = useGetFuturesDailyTradeStatsForMarket(marketAsset);
	const futuresDailyTradeStats = futuresDailyTradeStatsQuery?.data ?? null;

	const externalPriceQuery = useExternalPriceQuery(marketKey);
	const externalPrice = externalPriceQuery?.data ?? 0;
	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isEurForex(marketKey)
			? DEFAULT_FIAT_EURO_DECIMALS
			: undefined;

	const dailyPriceChangesQuery = useLaggedDailyPrice([marketKey]);
	const dailyPriceChanges = dailyPriceChangesQuery.data ?? [];

	const pastPrice = dailyPriceChanges.find((price) => price.synth === marketAsset);

	const fundingTitle = React.useMemo(
		() =>
			`${
				fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketInfo ? 'Inst.' : '1H'
			} Funding Rate`,
		[fundingRateQuery, avgFundingRate, marketInfo]
	);

	const data: MarketData = React.useMemo(() => {
		const fundingValue =
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketInfo
				? marketInfo?.currentFundingRate
				: avgFundingRate;

		const marketPrice = wei(marketInfo?.price ?? 0);

		if (mobile) {
			return {
				'Live Price': {
					value:
						externalPrice === 0
							? '-'
							: formatCurrency(selectedPriceCurrency.name, externalPrice, {
									sign: '$',
									minDecimals,
							  }),
				},
				'24H Trades': {
					value: !!futuresDailyTradeStats ? `${futuresDailyTradeStats ?? 0}` : NO_VALUE,
				},
				'Open Interest': {
					value: marketInfo?.marketSize?.mul(marketPrice)
						? formatCurrency(
								selectedPriceCurrency.name,
								marketInfo?.marketSize?.mul(marketPrice).toNumber(),
								{ sign: '$' }
						  )
						: NO_VALUE,
				},
				'24H Volume': {
					value: !!futuresTradingVolume
						? formatCurrency(selectedPriceCurrency.name, futuresTradingVolume ?? zeroBN, {
								sign: '$',
						  })
						: NO_VALUE,
				},
				[fundingTitle]: {
					value: fundingValue
						? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 })
						: NO_VALUE,
					color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
				},
				'24H Change': {
					value:
						marketPrice && marketPrice.gt(0) && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketPrice.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals }
							  )} (${formatPercent(marketPrice.sub(pastPrice.price).div(marketPrice) ?? zeroBN)})`
							: NO_VALUE,
					color:
						marketPrice && pastPrice?.price
							? marketPrice.sub(pastPrice.price).gt(zeroBN)
								? 'green'
								: marketPrice.sub(pastPrice.price).lt(zeroBN)
								? 'red'
								: ''
							: undefined,
				},
			};
		} else {
			return {
				[marketInfo?.marketName ?? '']: {
					value: formatCurrency(selectedPriceCurrency.name, marketPrice, {
						sign: '$',
						minDecimals,
					}),
				},
				'External Price': {
					value:
						externalPrice === 0
							? NO_VALUE
							: formatCurrency(selectedPriceCurrency.name, externalPrice, {
									sign: '$',
									minDecimals,
							  }),
				},
				'24H Change': {
					value:
						marketPrice && marketPrice.gt(0) && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketPrice.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals }
							  )} (${formatPercent(marketPrice.sub(pastPrice.price).div(marketPrice) ?? zeroBN)})`
							: NO_VALUE,
					color:
						marketPrice && pastPrice?.price
							? marketPrice.sub(pastPrice.price).gt(zeroBN)
								? 'green'
								: marketPrice.sub(pastPrice.price).lt(zeroBN)
								? 'red'
								: ''
							: undefined,
				},
				'24H Volume': {
					value: !!futuresTradingVolume
						? formatCurrency(selectedPriceCurrency.name, futuresTradingVolume ?? zeroBN, {
								sign: '$',
						  })
						: NO_VALUE,
				},
				'24H Trades': {
					value: !!futuresDailyTradeStats ? `${futuresDailyTradeStats ?? 0}` : NO_VALUE,
				},
				'Open Interest': {
					value: marketInfo?.marketSize?.mul(marketPrice)
						? formatCurrency(selectedPriceCurrency.name, marketInfo?.marketSize?.mul(marketPrice), {
								sign: '$',
						  })
						: NO_VALUE,
				},
				[fundingTitle]: {
					value: fundingValue
						? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 })
						: NO_VALUE,
					color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
				},
			};
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		marketAsset,
		marketInfo,
		futuresTradingVolume,
		futuresDailyTradeStats,
		selectedPriceCurrency.name,
		externalPrice,
		pastPrice?.price,
		avgFundingRate,
		fundingRateQuery,
		minDecimals,
	]);

	return data;
};

export default useGetMarketData;

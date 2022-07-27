import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import React from 'react';
import { useRecoilValue } from 'recoil';

import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { Period, PERIOD_IN_SECONDS } from 'constants/period';
import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetAverageFundingRateForMarket from 'queries/futures/useGetAverageFundingRateForMarket';
import useGetFuturesDailyTradeStatsForMarket from 'queries/futures/useGetFuturesDailyTrades';
import useGetFuturesTradingVolume from 'queries/futures/useGetFuturesTradingVolume';
import { Rates } from 'queries/rates/types';
import useExternalPriceQuery from 'queries/rates/useExternalPriceQuery';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import { currentMarketState, futuresMarketsState, marketKeyState } from 'store/futures';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset, isEurForex, MarketKeyByAsset } from 'utils/futures';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const useGetMarketData = (mobile?: boolean) => {
	const marketAsset = useRecoilValue(currentMarketState);
	const marketKey = useRecoilValue(marketKeyState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const futuresTradingVolumeQuery = useGetFuturesTradingVolume(marketAsset);

	const markets = futuresMarkets.map(({ asset }) => MarketKeyByAsset[asset]);
	const marketSummary = futuresMarkets.find(({ asset }) => asset === marketAsset);

	const futureRates = futuresMarkets.reduce((acc: Rates, { asset, price }) => {
		acc[MarketKeyByAsset[asset]] = price;
		return acc;
	}, {});
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const basePriceRate = React.useMemo(() => _.defaultTo(futureRates?.[marketKey], zeroBN), [
		futureRates,
		marketKey,
	]);

	const fundingRateQuery = useGetAverageFundingRateForMarket(
		marketAsset,
		basePriceRate.toNumber(),
		PERIOD_IN_SECONDS[Period.ONE_HOUR],
		marketSummary?.currentFundingRate.toNumber()
	);
	const avgFundingRate = fundingRateQuery?.data ?? null;

	const lastOracleUpdateTimeQuery = useRateUpdateQuery({
		baseCurrencyKey: marketAsset,
	});

	const lastOracleUpdateTime: Date = React.useMemo(
		() => lastOracleUpdateTimeQuery?.data ?? new Date(),
		[lastOracleUpdateTimeQuery]
	);

	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const futuresDailyTradeStatsQuery = useGetFuturesDailyTradeStatsForMarket(marketAsset);
	const futuresDailyTradeStats = futuresDailyTradeStatsQuery?.data ?? null;

	const externalPriceQuery = useExternalPriceQuery(marketKey);
	const externalPrice = externalPriceQuery?.data ?? 0;
	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isEurForex(marketKey)
			? DEFAULT_FIAT_EURO_DECIMALS
			: undefined;

	const dailyPriceChangesQuery = useLaggedDailyPrice(markets);
	const dailyPriceChanges = dailyPriceChangesQuery.data ?? [];

	const pastPrice = dailyPriceChanges.find((price) => price.synth === marketAsset);

	const assetName = `${getDisplayAsset(marketAsset)}-PERP`;
	const fundingTitle = React.useMemo(
		() =>
			`${
				fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary ? 'Inst.' : '1H'
			} Funding Rate`,
		[fundingRateQuery, avgFundingRate, marketSummary]
	);

	const data: MarketData = React.useMemo(() => {
		const fundingValue =
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary
				? marketSummary?.currentFundingRate
				: avgFundingRate;

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
					value: marketSummary?.marketSize?.mul(wei(basePriceRate))
						? formatCurrency(
								selectedPriceCurrency.name,
								marketSummary?.marketSize?.mul(wei(basePriceRate)).toNumber(),
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
						marketSummary?.price && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketSummary.price.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals }
							  )} (${formatPercent(
									marketSummary.price.sub(pastPrice.price).div(marketSummary.price) ?? zeroBN
							  )})`
							: NO_VALUE,
					color:
						marketSummary?.price && pastPrice?.price
							? marketSummary.price.sub(pastPrice.price).gt(zeroBN)
								? 'green'
								: marketSummary.price.sub(pastPrice.price).lt(zeroBN)
								? 'red'
								: ''
							: undefined,
				},
			};
		} else {
			return {
				[assetName]: {
					value:
						formatCurrency(selectedPriceCurrency.name, basePriceRate, {
							sign: '$',
							minDecimals,
						}) && lastOracleUpdateTime
							? formatCurrency(selectedPriceCurrency.name, basePriceRate, {
									sign: '$',
									minDecimals,
							  })
							: NO_VALUE,
				},
				'External Price': {
					value:
						externalPrice === 0
							? '-'
							: formatCurrency(selectedPriceCurrency.name, externalPrice, {
									sign: '$',
									minDecimals,
							  }),
				},
				'24H Change': {
					value:
						marketSummary?.price && pastPrice?.price
							? `${formatCurrency(
									selectedPriceCurrency.name,
									marketSummary.price.sub(pastPrice.price) ?? zeroBN,
									{ sign: '$', minDecimals }
							  )} (${formatPercent(
									marketSummary.price.sub(pastPrice.price).div(marketSummary.price) ?? zeroBN
							  )})`
							: NO_VALUE,
					color:
						marketSummary?.price && pastPrice?.price
							? marketSummary.price.sub(pastPrice.price).gt(zeroBN)
								? 'green'
								: marketSummary.price.sub(pastPrice.price).lt(zeroBN)
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
					value: marketSummary?.marketSize?.mul(wei(basePriceRate))
						? formatCurrency(
								selectedPriceCurrency.name,
								marketSummary?.marketSize?.mul(wei(basePriceRate)).toNumber(),
								{ sign: '$' }
						  )
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
		marketSummary,
		basePriceRate,
		futuresTradingVolume,
		futuresDailyTradeStats,
		selectedPriceCurrency.name,
		externalPrice,
		pastPrice?.price,
		avgFundingRate,
		fundingRateQuery,
		lastOracleUpdateTime,
		minDecimals,
	]);

	return data;
};

export default useGetMarketData;

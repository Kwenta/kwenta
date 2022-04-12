import React from 'react';
import styled from 'styled-components';

import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesTradingVolume from 'queries/futures/useGetFuturesTradingVolume';
import { FuturesMarket } from 'queries/futures/types';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import useGetFuturesDailyTradeStatsForMarket from 'queries/futures/useGetFuturesDailyTrades';
import useGetAverageFundingRateForMarket from 'queries/futures/useGetAverageFundingRateForMarket';
import useCoinGeckoPricesQuery from 'queries/coingecko/useCoinGeckoPricesQuery';
import { synthToCoingeckoPriceId } from './utils';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { Price } from 'queries/rates/types';
import { NO_VALUE } from 'constants/placeholder';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { getMarketKey } from 'utils/futures';
import Connector from 'containers/Connector';

type MarketDetailsProps = {
	baseCurrencyKey: CurrencyKey;
};

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const MarketDetails: React.FC<MarketDetailsProps> = ({ baseCurrencyKey }) => {
	const { network } = Connector.useContainer();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery({ refetchInterval: 6000 });
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresTradingVolumeQuery = useGetFuturesTradingVolume(baseCurrencyKey);

	const marketSummary: FuturesMarket | null =
		futuresMarketsQuery?.data?.find(({ asset }) => asset === baseCurrencyKey) ?? null;

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const basePriceRate = React.useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, baseCurrencyKey, selectedPriceCurrency]
	);

	const fundingRateQuery = useGetAverageFundingRateForMarket(baseCurrencyKey, basePriceRate);
	const avgFundingRate = fundingRateQuery?.data ?? null;

	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const futuresDailyTradeStatsQuery = useGetFuturesDailyTradeStatsForMarket(baseCurrencyKey);
	const futuresDailyTradeStats = futuresDailyTradeStatsQuery?.data ?? null;

	const marketKey = getMarketKey(baseCurrencyKey, network.id);
	const priceId = synthToCoingeckoPriceId(marketKey);
	const coinGeckoPricesQuery = useCoinGeckoPricesQuery([priceId]);
	const coinGeckoPrices = coinGeckoPricesQuery?.data ?? null;
	const externalPrice = coinGeckoPrices?.[priceId]?.usd ?? 0;

	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);
	const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];

	const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === baseCurrencyKey);

	const data: MarketData = React.useMemo(() => {
		const fundingTitle = `${
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary ? 'Inst.' : '24H'
		} Funding Rate`;
		const fundingValue =
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary
				? marketSummary?.currentFundingRate
				: avgFundingRate;

		return {
			[baseCurrencyKey
				? `${baseCurrencyKey[0] === 's' ? baseCurrencyKey.slice(1) : baseCurrencyKey}-PERP`
				: '']: {
				value: formatCurrency(selectedPriceCurrency.name, basePriceRate, { sign: '$' }),
			},
			'External Price': {
				value:
					externalPrice === 0
						? '-'
						: formatCurrency(selectedPriceCurrency.name, externalPrice, {
								sign: '$',
						  }),
			},
			'24H Change': {
				value:
					marketSummary?.price && pastPrice?.price
						? `${formatCurrency(
								selectedPriceCurrency.name,
								marketSummary?.price.sub(pastPrice?.price) ?? zeroBN,
								{ sign: '$' }
						  )} (${formatPercent(
								marketSummary?.price.sub(pastPrice?.price).div(marketSummary?.price) ?? zeroBN
						  )})`
						: NO_VALUE,
				color:
					marketSummary?.price && pastPrice?.price
						? marketSummary?.price.sub(pastPrice?.price).gt(zeroBN)
							? 'green'
							: marketSummary?.price.sub(pastPrice?.price).lt(zeroBN)
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
				value: marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)) ? (
					<StyledTooltip
						preset="bottom"
						content={`Long: ${formatCurrency(
							selectedPriceCurrency.name,
							marketSummary.marketSize
								.add(marketSummary.marketSkew)
								.div('2')
								.abs()
								.mul(basePriceRate ?? 0)
								.toNumber(),
							{ sign: '$' }
						)}
						Short: ${formatCurrency(
							selectedPriceCurrency.name,
							marketSummary.marketSize
								.sub(marketSummary.marketSkew)
								.div('2')
								.abs()
								.mul(basePriceRate ?? 0)
								.toNumber(),
							{ sign: '$' }
						)}`}
					>
						<span>
							{formatCurrency(
								selectedPriceCurrency.name,
								marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)).toNumber(),
								{ sign: '$' }
							)}
						</span>
					</StyledTooltip>
				) : (
					NO_VALUE
				),
			},
			[fundingTitle]: {
				value: fundingValue ? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 }) : NO_VALUE,
				color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
			},
			'Max Leverage': {
				value: marketSummary?.maxLeverage ? `${marketSummary?.maxLeverage.toString(0)}x` : NO_VALUE,
			},
		};
	}, [
		baseCurrencyKey,
		marketSummary,
		basePriceRate,
		futuresTradingVolume,
		futuresDailyTradeStats,
		selectedPriceCurrency.name,
		externalPrice,
		pastPrice?.price,
		avgFundingRate,
		fundingRateQuery,
	]);

	return (
		<MarketDetailsContainer>
			{Object.entries(data).map(([key, { value, color }]) => (
				<div key={key}>
					<p className="heading">{key}</p>
					<span className={color ? `value ${color}` : 'value'}>{value}</span>
				</div>
			))}
		</MarketDetailsContainer>
	);
};

const MarketDetailsContainer = styled.div`
	width: 100%;
	height: 55px;
	padding: 12px 45px 10px 15px;
	margin-bottom: 16px;
	box-sizing: border-box;

	display: flex;
	justify-content: space-between;
	align-items: start;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	p,
	span {
		margin: 0;
		text-align: left;
	}

	.heading {
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}

	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

export default MarketDetails;

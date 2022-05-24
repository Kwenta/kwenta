import React from 'react';
import styled from 'styled-components';

import { wei } from '@synthetixio/wei';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesTradingVolume from 'queries/futures/useGetFuturesTradingVolume';

import { FuturesMarket } from 'queries/futures/types';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import useGetFuturesDailyTradeStatsForMarket from 'queries/futures/useGetFuturesDailyTrades';
import useGetAverageFundingRateForMarket from 'queries/futures/useGetAverageFundingRateForMarket';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { Price, Rates } from 'queries/rates/types';
import { NO_VALUE } from 'constants/placeholder';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { getDisplayAsset, getMarketKey, isEurForex } from 'utils/futures';
import Connector from 'containers/Connector';
import { Period, PERIOD_IN_SECONDS } from 'constants/period';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import useExternalPriceQuery from 'queries/rates/useExternalPriceQuery';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

type MarketDetailsProps = {
	baseCurrencyKey: CurrencyKey;
};

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const MarketDetails: React.FC<MarketDetailsProps> = ({ baseCurrencyKey }) => {
	const { t } = useTranslation();
	const { network } = Connector.useContainer();

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresTradingVolumeQuery = useGetFuturesTradingVolume(baseCurrencyKey);

	const marketSummary: FuturesMarket | null =
		futuresMarketsQuery?.data?.find(({ asset }) => asset === baseCurrencyKey) ?? null;

	const futureRates = futuresMarketsQuery.isSuccess
		? futuresMarketsQuery?.data?.reduce((acc: Rates, { asset, price }) => {
				const currencyKey = getMarketKey(asset, network.id);
				acc[currencyKey] = price;
				return acc;
		  }, {})
		: null;

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const basePriceRate = React.useMemo(
		() => _.defaultTo(Number(futureRates?.[getMarketKey(baseCurrencyKey, network.id)]), 0),
		[futureRates, baseCurrencyKey, network.id]
	);

	const fundingRateQuery = useGetAverageFundingRateForMarket(
		baseCurrencyKey,
		basePriceRate,
		PERIOD_IN_SECONDS[Period.ONE_HOUR],
		marketSummary?.currentFundingRate.toNumber()
	);
	const avgFundingRate = fundingRateQuery?.data ?? null;

	const lastOracleUpdateTimeQuery = useRateUpdateQuery({
		baseCurrencyKey,
	});

	const lastOracleUpdateTime: Date = React.useMemo(
		() => lastOracleUpdateTimeQuery?.data ?? new Date(),
		[lastOracleUpdateTimeQuery]
	);

	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const futuresDailyTradeStatsQuery = useGetFuturesDailyTradeStatsForMarket(baseCurrencyKey);
	const futuresDailyTradeStats = futuresDailyTradeStatsQuery?.data ?? null;

	const externalPriceQuery = useExternalPriceQuery(baseCurrencyKey);
	const externalPrice = externalPriceQuery?.data ?? 0;
	const marketKey = getMarketKey(baseCurrencyKey, network.id);
	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isEurForex(marketKey)
			? DEFAULT_FIAT_EURO_DECIMALS
			: undefined;

	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);
	const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];

	const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === baseCurrencyKey);

	const data: MarketData = React.useMemo(() => {
		const fundingTitle = `${
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary ? 'Inst.' : '1H'
		} Funding Rate`;
		const fundingValue =
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary
				? marketSummary?.currentFundingRate
				: avgFundingRate;

		return {
			[baseCurrencyKey ? `${getDisplayAsset(baseCurrencyKey)}-PERP` : '']: {
				value:
					formatCurrency(selectedPriceCurrency.name, basePriceRate, {
						sign: '$',
						minDecimals,
					}) && lastOracleUpdateTime ? (
						<TimerTooltip preset="bottom" startTimeDate={lastOracleUpdateTime} width={'131px'}>
							<HoverTransform>
								{formatCurrency(selectedPriceCurrency.name, basePriceRate, {
									sign: '$',
									minDecimals,
								})}
							</HoverTransform>
						</TimerTooltip>
					) : (
						NO_VALUE
					),
			},
			'External Price': {
				value:
					externalPrice === 0 ? (
						'-'
					) : (
						<StyledTooltip
							preset="bottom"
							height={'auto'}
							content={t('exchange.market-details-card.tooltips.external-price')}
						>
							<HoverTransform>
								{formatCurrency(selectedPriceCurrency.name, externalPrice, {
									sign: '$',
									minDecimals,
								})}
							</HoverTransform>
						</StyledTooltip>
					),
			},
			'24H Change': {
				value:
					marketSummary?.price && pastPrice?.price ? (
						<StyledTooltip
							preset="bottom"
							height={'auto'}
							content={t('exchange.market-details-card.tooltips.24h-change')}
						>
							<HoverTransform>
								{`${formatCurrency(
									selectedPriceCurrency.name,
									marketSummary?.price.sub(pastPrice?.price) ?? zeroBN,
									{ sign: '$', minDecimals }
								)} (${formatPercent(
									marketSummary?.price.sub(pastPrice?.price).div(marketSummary?.price) ?? zeroBN
								)})`}
							</HoverTransform>
						</StyledTooltip>
					) : (
						NO_VALUE
					),
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
				value: !!futuresTradingVolume ? (
					<StyledTooltip
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-vol')}
					>
						<HoverTransform>
							{formatCurrency(selectedPriceCurrency.name, futuresTradingVolume ?? zeroBN, {
								sign: '$',
							})}
						</HoverTransform>
					</StyledTooltip>
				) : (
					NO_VALUE
				),
			},
			'24H Trades': {
				value: !!futuresDailyTradeStats ? (
					<StyledTooltip
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-trades')}
					>
						<HoverTransform>{`${futuresDailyTradeStats ?? 0}`}</HoverTransform>
					</StyledTooltip>
				) : (
					NO_VALUE
				),
			},
			'Open Interest': {
				value: marketSummary?.marketSize?.mul(wei(basePriceRate)) ? (
					<StyledTooltip
						preset="bottom"
						content={`Long: ${formatCurrency(
							selectedPriceCurrency.name,
							marketSummary.marketSize
								.add(marketSummary.marketSkew)
								.div('2')
								.abs()
								.mul(basePriceRate)
								.toNumber(),
							{ sign: '$' }
						)}
						Short: ${formatCurrency(
							selectedPriceCurrency.name,
							marketSummary.marketSize
								.sub(marketSummary.marketSkew)
								.div('2')
								.abs()
								.mul(basePriceRate)
								.toNumber(),
							{ sign: '$' }
						)}`}
					>
						<HoverTransform>
							{formatCurrency(
								selectedPriceCurrency.name,
								marketSummary?.marketSize?.mul(wei(basePriceRate)).toNumber(),
								{ sign: '$' }
							)}
						</HoverTransform>
					</StyledTooltip>
				) : (
					NO_VALUE
				),
			},
			[fundingTitle]: {
				value: fundingValue ? (
					<OneHrFundingRateTooltip
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.1h-funding-rate')}
					>
						<HoverTransform>
							{formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 })}
						</HoverTransform>
					</OneHrFundingRateTooltip>
				) : (
					NO_VALUE
				),
				color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
			},
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		lastOracleUpdateTime,
		minDecimals,
	]);

	const pausedClass = marketSummary?.isSuspended ? 'paused' : '';

	return (
		<MarketDetailsContainer>
			{Object.entries(data).map(([key, { value, color }]) => {
				const colorClass = color || '';

				return (
					<div key={key}>
						<p className="heading">{key}</p>
						<span className={`value ${colorClass} ${pausedClass}`}>{value}</span>
					</div>
				);
			})}
		</MarketDetailsContainer>
	);
};

const OneHrFundingRateTooltip = styled(StyledTooltip)`
	bottom: -145px;
	z-index: 2;
	left: -200px;
`;

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

	.paused {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

export const HoverTransform = styled.div`
	:hover {
		transform: scale(1.03);
	}
`;

export default MarketDetails;

import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import StyledTooltip from 'components/Tooltip/StyledTooltip';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
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
import media from 'styles/media';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset, isEurForex, MarketKeyByAsset } from 'utils/futures';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const { t } = useTranslation();

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

	const enableTooltip = (key: string, children: React.ReactElement) => {
		switch (key) {
			case 'External Price':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.external-price')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Change':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-change')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Volume':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-vol')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Trades':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-trades')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case 'Open Interest':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.open-interest')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case assetName:
				return (
					<TimerTooltip
						key={key}
						preset="bottom"
						startTimeDate={lastOracleUpdateTime}
						width={'131px'}
					>
						{children}
					</TimerTooltip>
				);
			case fundingTitle:
				return (
					<OneHrFundingRateTooltip
						key={key}
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.1h-funding-rate')}
					>
						{children}
					</OneHrFundingRateTooltip>
				);
			default:
				return children;
		}
	};

	const data: MarketData = React.useMemo(() => {
		const fundingValue =
			fundingRateQuery.failureCount > 0 && !avgFundingRate && !!marketSummary
				? marketSummary?.currentFundingRate
				: avgFundingRate;

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
				value: fundingValue ? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 }) : NO_VALUE,
				color: fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined,
			},
		};
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

	const pausedClass = marketSummary?.isSuspended ? 'paused' : '';

	return (
		<MarketDetailsContainer mobile={mobile}>
			{Object.entries(data).map(([key, { value, color }]) => {
				const colorClass = color || '';

				return enableTooltip(
					key,
					<WithCursor cursor="help">
						<div key={key}>
							<p className="heading">{key}</p>
							<span className={`value ${colorClass} ${pausedClass}`}>{value}</span>
						</div>
					</WithCursor>
				);
			})}
		</MarketDetailsContainer>
	);
};

// Extend type of cursor to accept different style of cursor. Currently accept only 'help'
const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const OneHrFundingRateTooltip = styled(StyledTooltip)`
	${media.greaterThan('sm')`
		bottom: -115px;
		z-index: 2;
		left: -200px;
		padding: 10px;
	`}
`;

const MarketDetailsTooltip = styled(StyledTooltip)`
	z-index: 2;
	padding: 10px;
`;

const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	width: 100%;
	height: 55px;
	padding: 10px 45px 10px 15px;
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
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	${(props) =>
		props.mobile &&
		css`
			height: auto;
			padding: 15px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-gap: 20px 0;

			.heading {
				margin-bottom: 2px;
			}
		`}
`;

export default MarketDetails;

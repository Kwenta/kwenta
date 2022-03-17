import React, { FC } from 'react';
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
import useCoinGeckoPricesQuery from 'queries/coingecko/useCoinGeckoPricesQuery';
import { synthToCoingeckoPriceId } from './utils';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { Price } from 'queries/rates/types';
import { NO_VALUE } from 'constants/placeholder';
import { Tooltip } from 'styles/common';

type MarketDetailsProps = {
	baseCurrencyKey: CurrencyKey;
};

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

const MarketDetails: React.FC<MarketDetailsProps> = ({ baseCurrencyKey }) => {
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
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

	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const futuresDailyTradeStatsQuery = useGetFuturesDailyTradeStatsForMarket(baseCurrencyKey);
	const futuresDailyTradeStats = futuresDailyTradeStatsQuery?.data ?? null;

	const priceId = synthToCoingeckoPriceId(baseCurrencyKey);
	const coinGeckoPricesQuery = useCoinGeckoPricesQuery([priceId]);
	const coinGeckoPrices = coinGeckoPricesQuery?.data ?? null;
	const livePrice = coinGeckoPrices?.[priceId].usd ?? 0;

	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);
	const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];

	const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === baseCurrencyKey);

	const data: MarketData = React.useMemo(() => {
		return {
			[`${baseCurrencyKey}/sUSD`]: {
				value: formatCurrency(selectedPriceCurrency.name, basePriceRate, { sign: '$' }),
			},
			'Live Price': {
				value: formatCurrency(selectedPriceCurrency.name, livePrice, {
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
					marketSummary?.price && pastPrice?.price ?
						marketSummary?.price.sub(pastPrice?.price) > zeroBN ? 'green' :
						marketSummary?.price.sub(pastPrice?.price) < zeroBN ? 'red' : "" : ""
			},
			'24H Volume': {
				value: 
					!!futuresTradingVolume ?
						formatCurrency(
							selectedPriceCurrency.name,
							futuresTradingVolume ?? zeroBN,
							{ sign: '$' }
						) : NO_VALUE
			},
			'24H Trades': {
				value: !!futuresDailyTradeStats ? `${futuresDailyTradeStats ?? 0}`: NO_VALUE,
			},
			'Open Interest': {
				value: 
					marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)) ?
						(
						<StyledTooltip
							placement="bottom"
							content={
									<>
										<div className="green">
											Long: {formatCurrency(
												selectedPriceCurrency.name,
												marketSummary.marketSize.add(marketSummary.marketSkew).div("2").abs().mul(basePriceRate ?? 0).toNumber(),
												{sign: '$' }
											)}
										</div>
										<div className="red">
											Short: {formatCurrency(
												selectedPriceCurrency.name,
												marketSummary.marketSize.sub(marketSummary.marketSkew).div("2").abs().mul(basePriceRate ?? 0).toNumber(),
												{sign: '$' }
											)}
										</div>
									</>
							}
							arrow={false}
						>
							<span>
								{formatCurrency(
									selectedPriceCurrency.name,
									marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)).toNumber(),
									{sign: '$' }
								)}
							</span>
						</StyledTooltip>
						) : NO_VALUE,
			},
			'24H Funding': {
				value: NO_VALUE,
			},
		};
	}, [
		baseCurrencyKey,
		marketSummary,
		basePriceRate,
		futuresTradingVolume,
		futuresDailyTradeStats,
		selectedPriceCurrency.name,
		livePrice,
		pastPrice?.price,
	]);

	return (
		<MarketDetailsContainer>
			{Object.entries(data).map(([key, { value, color }]) => (
				<div key={key}>
					<p className="heading">{key}</p>
					<p className={color ? `value ${color}` : 'value'}>{value}</p>
				</div>
			))}
		</MarketDetailsContainer>
	);
};

const MarketDetailsContainer = styled.div`
	width: 100%;
	padding: 12px 18px;
	margin-bottom: 16px;
	box-sizing: border-box;

	display: flex;
	justify-content: space-between;
	align-items: start;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 16px;
	box-sizing: border-box;

	p {
		margin: 0;
		text-align: left;
	}

	.heading {
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}

	.value {
		margin-top: 4px;
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 12px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
	}

	.green {
		color: ${(props) => props.theme.colors.green};
	}

	.red {
		color: ${(props) => props.theme.colors.red};
	}
`;

const StyledTooltip = styled(Tooltip)`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.mono};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	background: #131212;
`

export default MarketDetails;

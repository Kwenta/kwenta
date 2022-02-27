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

type MarketDetailsProps = {
	baseCurrencyKey: CurrencyKey;
};

type MarketData = Record<string, { value: string; color?: string }>;

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

	const data: MarketData = React.useMemo(() => {
		return {
			[`${baseCurrencyKey}/sUSD`]: {
				value: formatCurrency(selectedPriceCurrency.name, basePriceRate, { sign: '$' }),
			},
			'Live Price': {
				value: formatCurrency(selectedPriceCurrency.name, basePriceRate, {
					sign: '$',
				}),
			},
			'24H Change': {
				value: '$392.92 (1.8%)',
				color: 'red',
			},
			'24H Volume': {
				value: formatCurrency(
					selectedPriceCurrency.name,
					futuresTradingVolume?.mul(wei(basePriceRate ?? 0)) ?? zeroBN,
					{ sign: '$' }
				),
			},
			'24H Trades': {
				value: '22,321',
			},
			'Open Interest': {
				value: formatCurrency(
					selectedPriceCurrency.name,
					marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)) ?? zeroBN,
					{ sign: '$' }
				),
			},
			'24H Funding': {
				value: formatPercent(marketSummary?.currentFundingRate ?? zeroBN),
				color: 'green',
			},
		};
	}, [
		baseCurrencyKey,
		marketSummary,
		basePriceRate,
		futuresTradingVolume,
		selectedPriceCurrency.name,
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
	align-items: center;

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
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

export default MarketDetails;

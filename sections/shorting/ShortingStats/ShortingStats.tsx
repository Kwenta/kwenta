import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';

import useCollateralShortStats from 'queries/collateral/useCollateralShortStats';

import { NumericValue, Table } from 'styles/common';

import Currency from 'components/Currency';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import { formatCurrency, zeroBN } from 'utils/formatters/number';

import { SYNTHS_TO_SHORT } from '../constants';
import { Title } from '../common';
import useSynthetixQueries from '@synthetixio/queries';

const ShortingStats = () => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const { useExchangeRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const collateralShortStatsQuery = useCollateralShortStats(SYNTHS_TO_SHORT);
	const shortStats = useMemo(
		() => (collateralShortStatsQuery.isSuccess ? collateralShortStatsQuery.data ?? null : null),
		[collateralShortStatsQuery.isSuccess, collateralShortStatsQuery.data]
	);
	const shortStatsMap = useMemo(() => {
		if (shortStats != null && exchangeRates != null && selectPriceCurrencyRate != null) {
			return mapValues(shortStats, ({ shorts }, currencyKey) => {
				const assetUSDPrice = exchangeRates[currencyKey];

				const openInterest = shorts.mul(assetUSDPrice).div(selectPriceCurrencyRate);

				return {
					openInterest,
					currencyKey: currencyKey as CurrencyKey,
				};
			});
		}
		return null;
	}, [shortStats, exchangeRates, selectPriceCurrencyRate]);

	const total = useMemo(() => {
		if (shortStatsMap != null) {
			return reduce(shortStatsMap, (sum, short) => sum.add(short.openInterest), zeroBN);
		}
		return null;
	}, [shortStatsMap]);

	return (
		<div>
			<StyledTitle>{t('shorting.stats.title')}</StyledTitle>
			<Table>
				<thead>
					<TableRowHead>
						<TableCellHead colSpan={2}>{t('shorting.stats.table.asset')}</TableCellHead>
						<TableCellHead>{t('shorting.stats.table.open-interest')}</TableCellHead>
					</TableRowHead>
				</thead>
				<tbody>
					{SYNTHS_TO_SHORT.map((currencyKey) => (
						<TableRow key={currencyKey}>
							<TableCell colSpan={2}>
								<StyledCurrencyName currencyKey={currencyKey} showIcon={true} />
							</TableCell>
							<TableCell>
								<NumericValue>
									{shortStatsMap != null && shortStatsMap[currencyKey] != null
										? formatCurrency(
												selectedPriceCurrency.name,
												shortStatsMap[currencyKey].openInterest,
												{
													sign: selectedPriceCurrency.sign,
												}
										  )
										: NO_VALUE}
								</NumericValue>
							</TableCell>
						</TableRow>
					))}
					<TableRow>
						<TableCell colSpan={2}>
							<TotalLabel>{t('shorting.stats.table.total')}</TotalLabel>
						</TableCell>
						<TableCell>
							<NumericValue>
								{total != null
									? formatCurrency(selectedPriceCurrency.name, total, {
											sign: selectedPriceCurrency.sign,
									  })
									: NO_VALUE}
							</NumericValue>
						</TableCell>
					</TableRow>
				</tbody>
			</Table>
		</div>
	);
};

const StyledTitle = styled(Title)`
	padding-bottom: 0;
`;

const TableRow = styled.tr`
	text-align: left;
	height: 40px;
	border-bottom: 1px solid ${(props) => props.theme.colors.navy};
	&:last-child {
		border-bottom: 0;
	}
`;

const TableRowHead = styled(TableRow)``;

const TableCell = styled.td`
	color: ${(props) => props.theme.colors.white};
	&:last-child {
		text-align: right;
	}
`;

const TableCellHead = styled.th`
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
	&:last-child {
		text-align: right;
	}
`;

const StyledCurrencyName = styled(Currency.Name)`
	.symbol {
		font-size: 12px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const TotalLabel = styled.span`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default ShortingStats;

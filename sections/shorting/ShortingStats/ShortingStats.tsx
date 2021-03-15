import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';

import useCollateralShortStats from 'queries/collateral/useCollateralShortStats';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { NumericValue, Table } from 'styles/common';

import Currency from 'components/Currency';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import { formatCurrency, formatPercent, toBigNumber, zeroBN } from 'utils/formatters/number';
import { WEEKS_IN_YEAR } from 'utils/formatters/date';

import { SYNTHS_TO_SHORT } from '../constants';

const WEEKLY_SNX_REWARDS = toBigNumber(8000);

const ShortingStats = () => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

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
			return mapValues(shortStats, (shortStat, currencyKey) => {
				const openInterest = shortStat
					.multipliedBy(exchangeRates[currencyKey])
					.dividedBy(selectPriceCurrencyRate);

				const apr = WEEKLY_SNX_REWARDS.multipliedBy(exchangeRates[CRYPTO_CURRENCY_MAP.SNX])
					.multipliedBy(WEEKS_IN_YEAR)
					.dividedBy(openInterest);

				return {
					openInterest,
					apr,
					currencyKey,
				};
			});
		}
		return null;
	}, [shortStats, exchangeRates, selectPriceCurrencyRate]);

	const total = useMemo(() => {
		if (shortStatsMap != null) {
			return reduce(shortStatsMap, (sum, short) => sum.plus(short.openInterest), zeroBN);
		}
		return null;
	}, [shortStatsMap]);

	return (
		<div>
			<Title>{t('shorting.stats.title')}</Title>
			<Table>
				<thead>
					<TableRowHead>
						<TableCellHead>{t('shorting.stats.table.asset')}</TableCellHead>
						<TableCellHead>{t('shorting.stats.table.apr')}</TableCellHead>
						<TableCellHead>{t('shorting.stats.table.open-interest')}</TableCellHead>
					</TableRowHead>
				</thead>
				<tbody>
					{SYNTHS_TO_SHORT.map((currencyKey) => (
						<TableRow key={currencyKey}>
							<TableCell>
								<StyledCurrencyName currencyKey={currencyKey} showIcon={true} />
							</TableCell>
							<TableCell>
								<NumericValue>
									{shortStatsMap != null && shortStatsMap[currencyKey] != null
										? formatPercent(shortStatsMap[currencyKey].apr)
										: NO_VALUE}
								</NumericValue>
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

const Title = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	text-transform: capitalize;
	padding-bottom: 5px;
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

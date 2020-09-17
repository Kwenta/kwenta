import React, { memo, FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import { CellProps } from 'react-table';

import Table from 'components/Table';

import { HistoricalTrade, HistoricalTrades } from 'queries/trades/types';

import {
	LONG_CRYPTO_CURRENCY_DECIMALS,
	SHORT_CRYPTO_CURRENCY_DECIMALS,
	formatCurrencyWithKey,
	formatCurrency,
	formatCurrencyWithSign,
} from 'utils/formatters/number';

const USD_SIGN = '$';

type TradeHistoryProps = {
	trades: HistoricalTrades;
	isLoading: boolean;
	isLoaded: boolean;
};

const TradeHistory: FC<TradeHistoryProps> = memo(({ trades, isLoading, isLoaded }) => {
	const { t } = useTranslation();

	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: <>{t('assets.exchanges.table.orderType')}</>,
					accessor: 'toAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<Tooltip
							title={formatCurrency(
								String(cellProps.row.original.toAmount),
								LONG_CRYPTO_CURRENCY_DECIMALS
							)}
							placement="top"
						>
							<span>
								{formatCurrencyWithKey(
									cellProps.row.original.toCurrencyKey,
									cellProps.row.original.toAmount,
									SHORT_CRYPTO_CURRENCY_DECIMALS
								)}
							</span>
						</Tooltip>
					),
					sortable: true,
				},
				{
					Header: <>{t('assets.exchanges.table.from')}</>,
					accessor: 'fromAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<Tooltip
							title={formatCurrency(
								String(cellProps.row.original.fromAmount),
								LONG_CRYPTO_CURRENCY_DECIMALS
							)}
							placement="top"
						>
							<span>
								{formatCurrencyWithKey(
									cellProps.row.original.fromCurrencyKey,
									cellProps.row.original.fromAmount,
									SHORT_CRYPTO_CURRENCY_DECIMALS
								)}
							</span>
						</Tooltip>
					),
					sortable: true,
				},
				{
					Header: <>{t('assets.exchanges.table.to')}</>,
					accessor: 'price',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade, HistoricalTrade['price']>) => (
						<span>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value)}</span>
					),
					sortable: true,
				},
				{
					Header: <>{t('assets.exchanges.table.value')}</>,
					accessor: 'amount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade, HistoricalTrade['amount']>) => (
						<span>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value)}</span>
					),
					sortable: true,
				},
			]}
			data={trades.slice(0, 6)} // TODO paging
			isLoading={isLoading && !isLoaded}
			noResultsMessage={
				isLoaded && trades.length === 0 ? (
					<div>{t('assets.exchanges.table.no-results')}</div>
				) : undefined
			}
		/>
	);
});

const StyledTable = styled(Table)`
	position: initial;
	.table-body-cell {
		height: 38px;
	}
`;

export default TradeHistory;

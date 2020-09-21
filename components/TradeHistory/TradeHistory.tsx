import React, { memo, FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';

import Table from 'components/Table';

import { HistoricalTrade, HistoricalTrades } from 'queries/trades/types';

import { formatCurrency } from 'utils/formatters/number';
import { fonts } from 'styles/theme/fonts';
import { priceCurrencyState } from 'store/app';
import { useRecoilValue } from 'recoil';
import Currency from 'components/Currency';

type TradeHistoryProps = {
	trades: HistoricalTrades;
	isLoading: boolean;
	isLoaded: boolean;
};

const TradeHistory: FC<TradeHistoryProps> = memo(({ trades, isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: <StyledTableHeader>{t('assets.exchanges.table.orderType')}</StyledTableHeader>,
					accessor: 'orderType',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<StyledOrderType>{t('dashboard.transactions.orderTypeSort.market')}</StyledOrderType>
					),
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('assets.exchanges.table.from')}</StyledTableHeader>,
					accessor: 'fromAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.fromCurrencyKey}</StyledCurrencyKey>
							&nbsp;
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.fromCurrencyKey,
									cellProps.row.original.fromAmount
								)}
							</StyledPrice>
						</span>
					),
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('assets.exchanges.table.to')}</StyledTableHeader>,
					accessor: 'toAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.toCurrencyKey}</StyledCurrencyKey>
							&nbsp;
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.toCurrencyKey,
									cellProps.row.original.toAmount
								)}
							</StyledPrice>
						</span>
					),
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('assets.exchanges.table.value')}</StyledTableHeader>,
					accessor: 'amount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<StyledValue>
							<Currency.Price
								currencyKey={cellProps.row.original.toCurrencyKey}
								price={cellProps.row.original.toAmountInUSD}
								sign={selectedPriceCurrency.sign}
							/>
						</StyledValue>
					),
					sortable: true,
				},
			]}
			data={trades}
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
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	${fonts.body['bold-small']}
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	${fonts.body['thin-small']}
	color: ${(props) => props.theme.colors.white};
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.white};
`;

const StyledPrice = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const StyledValue = styled.div`
	${fonts.body['thin-small']}
	color: ${(props) => props.theme.colors.white};
`;

export default TradeHistory;

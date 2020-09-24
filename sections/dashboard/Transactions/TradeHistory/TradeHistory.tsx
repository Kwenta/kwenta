import React, { memo, FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps, Row } from 'react-table';

import { priceCurrencyState } from 'store/app';
import { useRecoilValue } from 'recoil';
import Table from 'components/Table';
import { HistoricalTrade, HistoricalTrades } from 'queries/trades/types';
import { formatCurrency } from 'utils/formatters/number';
import { fonts } from 'styles/theme/fonts';
import Currency from 'components/Currency';
import LinkIcon from 'assets/inline-svg/app/link.svg';

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
					sortType: 'alphanumeric',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<StyledOrderType>{t('dashboard.transactions.orderTypeSort.market')}</StyledOrderType>
					),
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('assets.exchanges.table.from')}</StyledTableHeader>,
					accessor: 'fromAmount',
					sortType: compareHistoricalTradeFromCurrencyKey,
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
					sortType: compareHistoricalTradeToCurrencyKey,
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
					sortType: compareHistoricalTradeUSDValue,
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
				{
					accessor: 'link',
					Cell: (cellProps: CellProps<HistoricalTrade>) => <StyledLinkIcon />,
					sortable: false,
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

// @ts-ignore
const StyledLinkIcon = styled(LinkIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
`;

const compareHistoricalTradeUSDValue = (rowA: Row<HistoricalTrade>, rowB: Row<HistoricalTrade>) =>
	rowA.original.toAmountInUSD > rowB.original.toAmountInUSD ? -1 : 1;

const compareHistoricalTradeFromCurrencyKey = (
	rowA: Row<HistoricalTrade>,
	rowB: Row<HistoricalTrade>
) => (rowA.original.fromCurrencyKey > rowB.original.fromCurrencyKey ? -1 : 1);

const compareHistoricalTradeToCurrencyKey = (
	rowA: Row<HistoricalTrade>,
	rowB: Row<HistoricalTrade>
) => (rowA.original.toCurrencyKey > rowB.original.toCurrencyKey ? -1 : 1);

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	${fonts.body.boldSmall};
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.white};
`;

const StyledPrice = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

export default TradeHistory;

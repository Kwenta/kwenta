import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Synth } from 'lib/synthetix';

import { HistoricalTrade, HistoricalTrades } from 'queries/trades/types';

import { formatCurrency } from 'utils/formatters/number';

import { NO_VALUE } from 'constants/placeholder';

import { ExternalLink, GridDivCenteredRow, NoTextTransform } from 'styles/common';

import Etherscan from 'containers/Etherscan';

import Table from 'components/Table';
import Currency from 'components/Currency';

import LinkIcon from 'assets/inline-svg/app/link.svg';
import NoNotificationIcon from 'assets/inline-svg/app/no-notifications.svg';

type TradeHistoryProps = {
	trades: HistoricalTrades;
	isLoading: boolean;
	isLoaded: boolean;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

/*

TODO: investigate if we need this

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
*/

const TradeHistory: FC<TradeHistoryProps> = ({
	trades,
	isLoading,
	isLoaded,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	const columnsDeps = useMemo(() => [selectPriceCurrencyRate], [selectPriceCurrencyRate]);

	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: (
						<StyledTableHeader>{t('dashboard.transactions.table.orderType')}</StyledTableHeader>
					),
					accessor: 'orderType',
					Cell: () => (
						<StyledOrderType>{t('dashboard.transactions.order-type-sort.market')}</StyledOrderType>
					),
					sortable: true,
					width: 200,
				},
				{
					Header: <StyledTableHeader>{t('dashboard.transactions.table.from')}</StyledTableHeader>,
					accessor: 'fromAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.fromCurrencyKey}</StyledCurrencyKey>
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.fromCurrencyKey,
									cellProps.row.original.fromAmount
								)}
							</StyledPrice>
						</span>
					),
					width: 200,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('dashboard.transactions.table.to')}</StyledTableHeader>,
					accessor: 'toAmount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.toCurrencyKey}</StyledCurrencyKey>
							<StyledPrice>
								{formatCurrency(
									cellProps.row.original.toCurrencyKey,
									cellProps.row.original.toAmount
								)}
							</StyledPrice>
						</span>
					),
					width: 200,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>
							<Trans
								i18nKey="common.currency.currency-value"
								values={{ currencyKey: selectedPriceCurrency.asset }}
								components={[<NoTextTransform />]}
							/>
						</StyledTableHeader>
					),
					accessor: 'amount',
					sortType: 'basic',
					Cell: (cellProps: CellProps<HistoricalTrade>) => (
						<Currency.Price
							currencyKey={cellProps.row.original.toCurrencyKey}
							price={cellProps.row.original.toAmountInUSD}
							sign={selectedPriceCurrency.sign}
							conversionRate={selectPriceCurrencyRate}
						/>
					),
					width: 200,
					sortable: true,
				},
				{
					id: 'link',
					Cell: (cellProps: CellProps<HistoricalTrade>) =>
						etherscanInstance != null && cellProps.row.original.hash ? (
							<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.hash)}>
								<StyledLinkIcon />
							</StyledExternalLink>
						) : (
							NO_VALUE
						),
					sortable: false,
				},
			]}
			columnsDeps={columnsDeps}
			data={trades}
			isLoading={isLoading && !isLoaded}
			noResultsMessage={
				isLoaded && trades.length === 0 ? (
					<TableNoResults>
						<NoNotificationIcon />
						{t('dashboard.transactions.table.no-results')}
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
		/>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

// @ts-ignore
const StyledLinkIcon = styled(LinkIcon)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
`;

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.white};
	padding-right: 10px;
`;

const StyledPrice = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

export default TradeHistory;

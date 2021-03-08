import React, { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';

import { formatDateWithTime } from 'utils/formatters/date';
import { formatNumber } from 'utils/formatters/number';

import { GridDivCenteredRow } from 'styles/common';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';

import AccruedInterestCol from './AccruedInterestCol';
import CRatioCol from './CRatioCol';
import LiquidationPriceCol from './LiquidationPriceCol';
import ProfitLossCol from './ProfitLossCol';
import ActionsCol from './ActionsCol';

import { StyledCurrencyKey, StyledPrice } from './common';
import media from 'styles/media';

type ShortingHistoryTableProps = {
	shortHistory: HistoricalShortPosition[];
	isLoading: boolean;
	isLoaded: boolean;
};

const ShortingHistoryTable: FC<ShortingHistoryTableProps> = ({
	shortHistory,
	isLoading,
	isLoaded,
}) => {
	const { t } = useTranslation();

	return (
		<Container>
			<Table
				palette="primary"
				columns={[
					{
						Header: <StyledTableHeader>{t('shorting.history.table.id')}</StyledTableHeader>,
						accessor: 'id',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<CellData>{cellProps.row.original.id}</CellData>
						),
						sortable: true,
						width: 50,
					},
					{
						Header: <StyledTableHeader>{t('shorting.history.table.date')}</StyledTableHeader>,
						accessor: 'date',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<CellData>{formatDateWithTime(cellProps.row.original.createdAt)}</CellData>
						),
						width: 140,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('shorting.history.table.shorting')}</StyledTableHeader>,
						accessor: 'synthBorrowedAmount',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<span>
								<StyledPrice>
									{formatNumber(cellProps.row.original.synthBorrowedAmount)}
								</StyledPrice>
								<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
							</span>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>{t('shorting.history.table.collateral')}</StyledTableHeader>,
						accessor: 'collateralLockedAmount',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<span>
								<StyledPrice>
									{formatNumber(cellProps.row.original.collateralLockedAmount)}
								</StyledPrice>
								<StyledCurrencyKey>{cellProps.row.original.collateralLocked}</StyledCurrencyKey>
							</span>
						),
						width: 120,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('shorting.history.table.liquidation-price')}</StyledTableHeader>
						),
						accessor: 'liquidationPrice',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<LiquidationPriceCol cellProps={cellProps} />
						),
						width: 120,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('shorting.history.table.accrued-interest')}</StyledTableHeader>
						),
						accessor: 'accruedInterest',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<AccruedInterestCol cellProps={cellProps} />
						),
						width: 120,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('shorting.history.table.collateral-ratio')}</StyledTableHeader>
						),
						accessor: 'cRatio',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<CRatioCol cellProps={cellProps} />
						),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('shorting.history.table.profit-loss')}</StyledTableHeader>
						),
						accessor: 'profitLoss',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<ProfitLossCol cellProps={cellProps} />
						),
						width: 80,
						sortable: true,
					},
					{
						id: 'actions',
						Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
							<ActionsCol cellProps={cellProps} />
						),
						sortable: false,
						width: 50,
					},
				]}
				data={shortHistory}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && shortHistory.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('shorting.history.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
				pageSize={10}
			/>
		</Container>
	);
};

const Container = styled.div`
	margin: 16px 0;
	${media.lessThan('md')`
		margin-bottom: 86px;
	`}
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.blueberry};
`;

const CellData = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

export default ShortingHistoryTable;

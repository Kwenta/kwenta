import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';

import { formatDateWithTime } from 'utils/formatters/date';
import { formatNumber, formatPercent, formatCurrency } from 'utils/formatters/number';

import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import { ExternalLink, GridDivCenteredRow, IconButton } from 'styles/common';
import Etherscan from 'containers/Etherscan';

import Table from 'components/Table';

import EditIcon from 'assets/svg/app/edit.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { Short } from 'queries/collateral/subgraph/types';

type ShortingHistoryTableProps = {
	shortHistory: Short[];
	isLoading: boolean;
	isLoaded: boolean;
};

const ShortingHistoryTable: FC<ShortingHistoryTableProps> = ({
	shortHistory,
	isLoading,
	isLoaded,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const columnsDeps = useMemo(() => [selectPriceCurrencyRate], [selectPriceCurrencyRate]);
	const router = useRouter();

	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: <StyledTableHeader>{t('shorting.history.table.id')}</StyledTableHeader>,
					accessor: 'id',
					Cell: (cellProps: CellProps<Short>) => <WhiteText>{cellProps.row.original.id}</WhiteText>,
					sortable: true,
					width: 50,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.date')}</StyledTableHeader>,
					accessor: 'date',
					Cell: (cellProps: CellProps<Short>) => (
						<WhiteText>{formatDateWithTime(cellProps.row.original.createdAt)}</WhiteText>
					),
					width: 80,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.shorting')}</StyledTableHeader>,
					accessor: 'synthBorrowedAmount',
					Cell: (cellProps: CellProps<Short>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
							<StyledPrice>{formatNumber(cellProps.row.original.synthBorrowedAmount)}</StyledPrice>
						</span>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.collateral')}</StyledTableHeader>,
					accessor: 'collateralLockedAmount',
					Cell: (cellProps: CellProps<Short>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.collateralLocked}</StyledCurrencyKey>
							<StyledPrice>
								{formatNumber(cellProps.row.original.collateralLockedAmount)}
							</StyledPrice>
						</span>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('shorting.history.table.liquidationPrice')}</StyledTableHeader>
					),
					accessor: 'liquidationPrice',
					Cell: (cellProps: CellProps<Short>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
							<StyledPrice>
								{formatNumber(
									(cellProps.row.original.collateralLockedAmount *
										cellProps.row.original.collateralLockedPrice) /
										(cellProps.row.original.synthBorrowedAmount *
											(cellProps.row.original.contractData?.minCratio ?? 0))
								)}
							</StyledPrice>
						</span>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('shorting.history.table.interestAccrued')}</StyledTableHeader>
					),
					accessor: 'interestAccrued',
					Cell: (cellProps: CellProps<Short>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
							<StyledPrice>{formatNumber(cellProps.row.original.interestAccrued)}</StyledPrice>
						</span>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.cRatio')}</StyledTableHeader>,
					accessor: 'cRatio',
					Cell: (cellProps: CellProps<Short>) => (
						<PriceChangeText isPositive={true}>
							{formatPercent(
								(cellProps.row.original.collateralLockedAmount *
									cellProps.row.original.collateralLockedPrice) /
									(cellProps.row.original.synthBorrowedAmount *
										cellProps.row.original.synthBorrowedPrice)
							)}
						</PriceChangeText>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.profitLoss')}</StyledTableHeader>,
					accessor: 'profitLoss',
					Cell: () => (
						<PriceChangeText isPositive={true}>
							{/* 
									TODO need to calculate profit and loss - this is a bit tricky
							*/}
							{true ? '+' : '-'}{' '}
							{formatCurrency(selectedPriceCurrency.name, 200, {
								sign: selectedPriceCurrency.sign,
							})}
						</PriceChangeText>
					),
					width: 100,
					sortable: true,
				},
				{
					id: 'edit',
					Cell: (cellProps: CellProps<Short>) => (
						<IconButton
							onClick={() =>
								router.push(
									ROUTES.Shorting.ManageShortAddCollateral(`${cellProps.row.original.id}`)
								)
							}
						>
							<StyledLinkIcon src={EditIcon} viewBox={`0 0 ${EditIcon.width} ${EditIcon.height}`} />
						</IconButton>
					),
					sortable: false,
					width: 30,
				},
				{
					id: 'link',
					Cell: (cellProps: CellProps<Short>) =>
						etherscanInstance != null && cellProps.row.original.txHash ? (
							<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.txHash)}>
								<StyledLinkIcon
									src={LinkIcon}
									viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
								/>
							</StyledExternalLink>
						) : (
							NO_VALUE
						),
					sortable: false,
					width: 30,
				},
			]}
			columnsDeps={columnsDeps}
			data={shortHistory}
			isLoading={isLoading && !isLoaded}
			noResultsMessage={
				isLoaded && shortHistory.length === 0 ? (
					<TableNoResults>
						<Svg src={NoNotificationIcon} />
						{t('shorting.history.table.noResults')}
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
			pageSize={6}
		/>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

const StyledLinkIcon = styled(Svg)`
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

const WhiteText = styled.div`
	color: ${(props) => props.theme.colors.white};
`;

const StyledCurrencyKey = styled.span`
	color: ${(props) => props.theme.colors.white};
	padding-right: 10px;
`;

const StyledPrice = styled.span`
	color: ${(props) => props.theme.colors.silver};
`;

const PriceChangeText = styled.span<{ isPositive: boolean }>`
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
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

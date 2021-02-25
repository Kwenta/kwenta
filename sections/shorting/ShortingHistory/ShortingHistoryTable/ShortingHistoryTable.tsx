import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';

import { formatDateWithTime } from 'utils/formatters/date';
import { formatNumber, formatPercent, formatCurrency } from 'utils/formatters/number';

import ROUTES from 'constants/routes';
import { ExternalLink, GridDivCenteredCol, GridDivCenteredRow, IconButton } from 'styles/common';
import Etherscan from 'containers/Etherscan';

import Table from 'components/Table';

import EditIcon from 'assets/svg/app/edit.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

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
	const { etherscanInstance } = Etherscan.useContainer();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const router = useRouter();

	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortContractInfo = collateralShortContractInfoQuery.isSuccess
		? collateralShortContractInfoQuery?.data ?? null
		: null;

	const minCratio = collateralShortContractInfo?.minCollateralRatio;

	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const columnsDeps = useMemo(() => [minCratio, exchangeRates, selectPriceCurrencyRate], [
		minCratio,
		selectPriceCurrencyRate,
		exchangeRates,
	]);

	return (
		<StyledTable
			palette="primary"
			columns={[
				{
					Header: <StyledTableHeader>{t('shorting.history.table.id')}</StyledTableHeader>,
					accessor: 'id',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
						<WhiteText>{cellProps.row.original.id}</WhiteText>
					),
					sortable: true,
					width: 50,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.date')}</StyledTableHeader>,
					accessor: 'date',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
						<WhiteText>{formatDateWithTime(cellProps.row.original.createdAt)}</WhiteText>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.shorting')}</StyledTableHeader>,
					accessor: 'synthBorrowedAmount',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
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
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
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
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => {
						const {
							collateralLockedAmount,
							synthBorrowedAmount,
							collateralLocked,
							synthBorrowed,
						} = cellProps.row.original;

						const collateralLockedPrice = getExchangeRatesForCurrencies(
							exchangeRates,
							collateralLocked,
							selectedPriceCurrency.name
						);

						return (
							<span>
								<StyledCurrencyKey>{synthBorrowed}</StyledCurrencyKey>
								<StyledPrice>
									{formatCurrency(
										collateralLocked,
										collateralLockedAmount
											.multipliedBy(collateralLockedPrice)
											.dividedBy(
												synthBorrowedAmount.multipliedBy(minCratio ? minCratio.toNumber() : 0)
											),
										{
											sign: selectedPriceCurrency.sign,
										}
									)}
								</StyledPrice>
							</span>
						);
					},
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('shorting.history.table.accruedInterest')}</StyledTableHeader>
					),
					accessor: 'accruedInterest',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
						<span>
							<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
							<StyledPrice>{formatNumber(cellProps.row.original.accruedInterest)}</StyledPrice>
						</span>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: <StyledTableHeader>{t('shorting.history.table.cRatio')}</StyledTableHeader>,
					accessor: 'cRatio',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => {
						const {
							collateralLockedAmount,
							synthBorrowedAmount,
							synthBorrowed,
							collateralLocked,
						} = cellProps.row.original;

						const collateralLockedPrice = getExchangeRatesForCurrencies(
							exchangeRates,
							collateralLocked,
							selectedPriceCurrency.name
						);

						const synthBorrowedPrice = getExchangeRatesForCurrencies(
							exchangeRates,
							synthBorrowed,
							selectedPriceCurrency.name
						);

						return (
							<PriceChangeText isPositive={true}>
								{formatPercent(
									collateralLockedAmount
										.multipliedBy(collateralLockedPrice)
										.dividedBy(synthBorrowedAmount.multipliedBy(synthBorrowedPrice))
								)}
							</PriceChangeText>
						);
					},
					width: 50,
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
					width: 80,
					sortable: true,
				},
				{
					id: 'actions',
					Cell: (cellProps: CellProps<HistoricalShortPosition>) => (
						<ActionsContainer>
							<IconButton
								onClick={() =>
									router.push(
										ROUTES.Shorting.ManageShortAddCollateral(`${cellProps.row.original.id}`)
									)
								}
							>
								<StyledLinkIcon
									src={EditIcon}
									viewBox={`0 0 ${EditIcon.width} ${EditIcon.height}`}
								/>
							</IconButton>
							{etherscanInstance != null && cellProps.row.original.txHash && (
								<StyledExternalLink href={etherscanInstance.txLink(cellProps.row.original.txHash)}>
									<StyledLinkIcon
										src={LinkIcon}
										viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
									/>
								</StyledExternalLink>
							)}
						</ActionsContainer>
					),
					sortable: false,
					width: 50,
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

const StyledExternalLink = styled(ExternalLink)``;

const ActionsContainer = styled(GridDivCenteredCol)`
	grid-gap: 10px;
	margin-left: auto;

	button {
		&:hover {
			color: ${(props) => props.theme.colors.goldColors.color1};
		}
	}
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

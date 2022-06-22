import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { currentMarketState } from 'store/futures';

import useGetFuturesMarginTransfers from 'queries/futures/useGetFuturesMarginTransfers';
import { GridDivCenteredRow } from 'styles/common';
import Table from 'components/Table';
import { timePresentation } from 'utils/formatters/date';
import { SectionHeader } from '../common';

const TransfersTab: React.FC = () => {
	const marketAsset = useRecoilValue(currentMarketState);

	const marginTransfersQuery = useGetFuturesMarginTransfers(marketAsset);
	const marginTransfers = React.useMemo(
		() => (marginTransfersQuery.isSuccess ? marginTransfersQuery?.data ?? [] : []),
		[marginTransfersQuery.isSuccess, marginTransfersQuery.data]
	);

	const { isLoading, isFetched: isLoaded } = marginTransfersQuery;

	const { t } = useTranslation();
	const columnsDeps = React.useMemo(() => [marginTransfers], [marginTransfers]);

	return (
		<div>
			<SectionHeader>Transfers</SectionHeader>

			<StyledTable
				highlightRowsOnHover
				columns={[
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.action')}
							</StyledTableHeader>
						),
						accessor: 'action',
						Cell: (cellProps: any) => <StyledActionCell>{cellProps.value}</StyledActionCell>,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.amount')}
							</StyledTableHeader>
						),
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: any) => (
							<StyledAmountCell isPositive={cellProps.row.original.isPositive}>
								{cellProps.value}
							</StyledAmountCell>
						),
						sortable: true,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.transfers.table.date')}</StyledTableHeader>
						),
						accessor: 'timestamp',
						Cell: (cellProps: any) => (
							<DefaultCell>{timePresentation(cellProps.value, t)}</DefaultCell>
						),
						width: 50,
					},
				]}
				data={marginTransfers}
				columnsDeps={columnsDeps}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					marginTransfers?.length === 0 ? (
						<TableNoResults>
							<StyledTitle>{t('futures.market.user.transfers.table.no-results')}</StyledTitle>
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
				pageSize={5}
			/>
		</div>
	);
};

const StyledTable = styled(Table)`
	/* margin-top: 20px; */
`;

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const StyledActionCell = styled(DefaultCell)`
	text-transform: capitalize;
`;

const StyledTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 16px;
	margin: 0;
`;

const StyledAmountCell = styled(DefaultCell)<{ isPositive: boolean }>`
	color: ${(props: any) =>
		props.isPositive
			? props.theme.colors.common.primaryGreen
			: props.theme.colors.common.primaryRed};
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: transparent;
	margin-top: -2px;
	justify-items: center;
`;

export default TransfersTab;

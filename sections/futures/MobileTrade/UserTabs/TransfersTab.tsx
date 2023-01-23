import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Table, { TableHeader, TableNoResults } from 'components/Table';
import useGetFuturesMarginTransfers from 'queries/futures/useGetFuturesMarginTransfers';
import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import { timePresentation } from 'utils/formatters/date';

const TransfersTab: React.FC = () => {
	const marginTransfersQuery = useGetFuturesMarginTransfers();
	const marginTransfers = React.useMemo(() => marginTransfersQuery?.data ?? [], [
		marginTransfersQuery.data,
	]);

	const { isLoading, isFetched: isLoaded } = marginTransfersQuery;

	const { t } = useTranslation();
	const columnsDeps = React.useMemo(() => [marginTransfers], [marginTransfers]);

	return (
		<div>
			<SectionHeader>
				<SectionTitle>Transfers</SectionTitle>
			</SectionHeader>

			<Table
				highlightRowsOnHover
				columns={[
					{
						Header: <TableHeader>{t('futures.market.user.transfers.table.action')}</TableHeader>,
						accessor: 'action',
						Cell: (cellProps: any) => <StyledActionCell>{cellProps.value}</StyledActionCell>,
						width: 50,
					},
					{
						Header: <TableHeader>{t('futures.market.user.transfers.table.amount')}</TableHeader>,
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
						Header: <TableHeader>{t('futures.market.user.transfers.table.date')}</TableHeader>,
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
				showPagination
				pageSize={5}
			/>
		</div>
	);
};

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const StyledActionCell = styled(DefaultCell)`
	text-transform: capitalize;
`;

const StyledTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 16px;
	margin: 0;
`;

const StyledAmountCell = styled(DefaultCell)<{ isPositive: boolean }>`
	color: ${(props: any) =>
		props.isPositive
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
`;

export default TransfersTab;

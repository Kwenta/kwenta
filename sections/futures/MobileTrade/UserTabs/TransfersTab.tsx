import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ColoredPrice from 'components/ColoredPrice';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import { selectMarginTransfers, selectQueryStatuses } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { timePresentation } from 'utils/formatters/date';
import { formatDollars } from 'utils/formatters/number';

const TransfersTab: React.FC = () => {
	const marginTransfers = useAppSelector(selectMarginTransfers);
	const {
		marginTransfers: { status: marginTransfersStatus },
	} = useAppSelector(selectQueryStatuses);

	const { t } = useTranslation();
	const columnsDeps = useMemo(() => [marginTransfers, marginTransfersStatus], [
		marginTransfers,
		marginTransfersStatus,
	]);

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
						accessor: 'size',
						sortType: 'basic',
						Cell: (cellProps: any) => {
							const formatOptions = {
								minDecimals: 0,
							};

							return (
								<ColoredPrice
									priceInfo={{
										price: cellProps.row.original.size,
										change: cellProps.row.original.action === 'deposit' ? 'up' : 'down',
									}}
								>
									{cellProps.row.original.action === 'deposit' ? '+' : ''}
									{formatDollars(cellProps.row.original.size, formatOptions)}
								</ColoredPrice>
							);
						},
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
				isLoading={marginTransfers.length === 0 && marginTransfersStatus === FetchStatus.Loading}
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

export default TransfersTab;

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ColoredPrice from 'components/ColoredPrice';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { Body } from 'components/Text';
import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import { selectMarketMarginTransfers, selectQueryStatuses } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { timePresentation } from 'utils/formatters/date';
import { formatDollars } from 'utils/formatters/number';

const TransfersTab: React.FC = () => {
	const marginTransfers = useAppSelector(selectMarketMarginTransfers);
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
						Cell: (cellProps: any) => <ActionCell>{cellProps.value}</ActionCell>,
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
						Cell: (cellProps: any) => <Body>{timePresentation(cellProps.value, t)}</Body>,
						width: 50,
					},
				]}
				data={marginTransfers}
				columnsDeps={columnsDeps}
				isLoading={marginTransfers.length === 0 && marginTransfersStatus === FetchStatus.Loading}
				noResultsMessage={
					marginTransfers?.length === 0 ? (
						<TableNoResults>
							<Body size="large">{t('futures.market.user.transfers.table.no-results')}</Body>
						</TableNoResults>
					) : undefined
				}
				showPagination
				pageSize={5}
			/>
		</div>
	);
};

const ActionCell = styled(Body)`
	text-transform: capitalize;
`;

export default TransfersTab;

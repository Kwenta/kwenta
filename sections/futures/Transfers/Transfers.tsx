import Card from 'components/Card';
import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { MarginTransfer } from 'queries/futures/types';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { GridDivCenteredRow } from 'styles/common';

import Trades from '../Trades';

type TransferProps = {
	marginTransfers: MarginTransfer[] | null;
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ marginTransfers, isLoading, isLoaded }: TransferProps) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();
	console.log(marginTransfers);
	const columnsDeps = useMemo(() => [marginTransfers], [marginTransfers]);

	return (
		<Card>
			<StyledTable
				palette="primary"
				highlightRowsOnHover
				columns={[
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.action')}
							</StyledTableHeader>
						),
						accessor: 'action',
						// : CellProps<any></any>
						Cell: (cellProps: any) => cellProps.value,
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
						// : CellProps<any></any>
						Cell: (cellProps: any) => cellProps.value,
						sortable: true,
						width: 100,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.transfers.table.date')}</StyledTableHeader>
						),
						accessor: 'timestamp',
						// : CellProps<any></any>
						Cell: (cellProps: any) => cellProps.value,
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.transaction')}
							</StyledTableHeader>
						),
						accessor: 'account',
						// : CellProps<any></any>
						Cell: (cellProps: any) => {
							// blockExplorerInstance?.txLink(cellProps.value),
							return cellProps.value;
						},
						width: 50,
					},
				]}
				data={marginTransfers || []}
				columnsDeps={columnsDeps}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && Trades.length === 0 ? (
						<TableNoResults>
							{/* <Svg src={NoNotificationIcon} /> */}
							{t('futures.market.user.transfers.table.no-results')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</Card>
	);
};

export default Transfers;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

const StyledPositionSize = styled.div`
	margin-left: 4px;
	/* ${BoldTableText} */
	text-transform: none;
`;

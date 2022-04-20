import Card from 'components/Card';
import Table from 'components/Table';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { CellProps } from 'recharts';
import styled from 'styled-components';
import { FlexDivCentered, GridDivCenteredRow } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Trades from '../Trades';

type TransferProps = {
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ isLoading, isLoaded }: TransferProps) => {
	const { t } = useTranslation();

	const data = [
		{
			action: 'withdrawal',
			amount: '$10,000',
			date: '12 hours ago',
			transaction: '0x12441...AVAUB124',
		},
	];

	const columnsDeps = useMemo(() => [data], [data]);

	return (
		<Card>
			<StyledTable
				palette="primary"
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
						accessor: 'date',
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
						accessor: 'transaction',
						// : CellProps<any></any>
						Cell: (cellProps: any) => cellProps.value,
						width: 50,
					},
				]}
				data={data || []}
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
	color: ${(props) => props.theme.colors.blueberry};
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

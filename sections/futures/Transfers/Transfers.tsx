import { Synths } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { differenceInSeconds, format } from 'date-fns';
import { MarginTransfer } from 'queries/futures/types';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExternalLink, GridDivCenteredRow } from 'styles/common';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';

type TransferProps = {
	marginTransfers: MarginTransfer[] | [];
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ marginTransfers, isLoading, isLoaded }: TransferProps) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();
	const columnsDeps = useMemo(() => [marginTransfers], [marginTransfers]);
	console.log(marginTransfers);
	function timePresentation(timestamp: string) {
		const actionTime = new Date(Number(timestamp) * 1000);
		const seconds = differenceInSeconds(new Date(), actionTime);
		if (seconds < 60) {
			return t('common.time.n-sec-ago', { timeDelta: seconds });
		}

		if (seconds < 3600) {
			return t('common.time.n-min-ago', {
				timeDelta: Math.floor(seconds / 60),
			});
		}

		if (seconds < 86400) {
			return t('common.time.n-hr-ago', {
				timeDelta: Math.floor(seconds / 3600),
			});
		}

		if (seconds < 604800) {
			return t('common.time.n-day-ago', {
				timeDelta: Math.floor(seconds / 86400),
			});
		}

		if (seconds < 1209600) {
			return t('common.time.n-week-ago', {
				timeDelta: Math.floor(seconds / 604800),
			});
		}

		return format(actionTime, 'MM/dd/yyyy');
	}

	return (
		<TableContainer>
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
						width: 100,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.transfers.table.date')}</StyledTableHeader>
						),
						accessor: 'timestamp',
						Cell: (cellProps: any) => (
							<DefaultCell>{timePresentation(cellProps.value)}</DefaultCell>
						),
						width: 50,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.transfers.table.transaction')}
							</StyledTableHeader>
						),
						accessor: 'account',
						Cell: (cellProps: any) => {
							return (
								<DefaultCell>
									<ExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
										{truncateAddress(cellProps.value)}
									</ExternalLink>
								</DefaultCell>
							);
						},
						width: 50,
					},
				]}
				data={marginTransfers || []}
				columnsDeps={columnsDeps}
				isLoading={isLoading && !isLoaded}
				noResultsMessage={
					isLoaded && marginTransfers?.length === 0 ? (
						<TableNoResults>
							{t('futures.market.user.transfers.table.no-results')}
							{t('futures.market.user.transfers.table.deposit')}
						</TableNoResults>
					) : undefined
				}
				showPagination={true}
			/>
		</TableContainer>
	);
};

export default Transfers;

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const DefaultCell = styled.p``;

const TableContainer = styled.div`
	margin-bottom: 15px;
`;

const StyledActionCell = styled(DefaultCell)`
	text-transform: capitalize;
`;

const StyledAmountCell = styled(DefaultCell)<{ isPositive: boolean }>`
	color: ${(props: any) =>
		props.isPositive
			? props.theme.colors.common.primaryGreen
			: props.theme.colors.common.primaryRed};
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	min-height: 60px;
	justify-content: center;
	background-color: transparent;
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
`;

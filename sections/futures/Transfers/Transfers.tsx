import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { differenceInSeconds, format } from 'date-fns';
import { MarginTransfer } from 'queries/futures/types';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ExternalLink, GridDivCenteredRow } from 'styles/common';
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

		if (seconds < 2419200) {
			return t('common.time.n-week-ago', {
				timeDelta: Math.floor(seconds / 604800),
			});
		}

		return format(actionTime, 'MM/dd/yyyy');
	}

	return (
		<StyledTable
			highlightRowsOnHover
			columns={[
				{
					Header: (
						<StyledTableHeader>{t('futures.market.user.transfers.table.action')}</StyledTableHeader>
					),
					accessor: 'action',
					Cell: (cellProps: any) => <StyledActionCell>{cellProps.value}</StyledActionCell>,
					width: 50,
				},
				{
					Header: (
						<StyledTableHeader>{t('futures.market.user.transfers.table.amount')}</StyledTableHeader>
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
					Cell: (cellProps: any) => <DefaultCell>{timePresentation(cellProps.value)}</DefaultCell>,
					width: 50,
				},
				{
					Header: (
						<StyledTableHeader>
							{t('futures.market.user.transfers.table.transaction')}
						</StyledTableHeader>
					),
					accessor: 'txHash',
					Cell: (cellProps: any) => {
						return (
							<DefaultCell>
								<StyledExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
									{truncateAddress(cellProps.value)}
								</StyledExternalLink>
							</DefaultCell>
						);
					},
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
		/>
	);
};

export default Transfers;

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

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
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

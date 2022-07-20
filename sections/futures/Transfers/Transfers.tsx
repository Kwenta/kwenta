import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { MarginTransfer } from 'queries/futures/types';
import { ExternalLink, GridDivCenteredRow } from 'styles/common';
import { timePresentation } from 'utils/formatters/date';
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

	return (
		<Table
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
					Cell: (cellProps: any) => (
						<DefaultCell>{timePresentation(cellProps.value, t)}</DefaultCell>
					),
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
			showPagination
		/>
	);
};

export default Transfers;

const DefaultCell = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
`;

const StyledActionCell = styled(DefaultCell)`
	text-transform: capitalize;
`;

const StyledTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 16px;
	margin: 0;
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

const StyledAmountCell = styled(DefaultCell)<{ isPositive: boolean }>`
	color: ${(props: any) =>
		props.isPositive
			? props.theme.colors.selectedTheme.green
			: props.theme.colors.selectedTheme.red};
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

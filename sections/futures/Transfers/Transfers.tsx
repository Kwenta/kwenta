import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Table, { TableNoResults } from 'components/Table';
import { blockExplorer } from 'containers/Connector/Connector';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { MarginTransfer } from 'queries/futures/types';
import { ExternalLink } from 'styles/common';
import { timePresentation } from 'utils/formatters/date';
import { truncateAddress } from 'utils/formatters/string';

type TransferProps = {
	marginTransfers: MarginTransfer[];
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ marginTransfers, isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();
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
								<StyledExternalLink href={blockExplorer.txLink(cellProps.value)}>
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
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : (
					<TableNoResults>
						<StyledTitle>{t('futures.market.user.transfers.table.no-results')}</StyledTitle>
					</TableNoResults>
				)
			}
			showPagination
			pageSize={5}
		/>
	);
};

export default Transfers;

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

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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

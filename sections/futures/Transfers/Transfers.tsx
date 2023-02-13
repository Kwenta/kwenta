import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ColoredPrice from 'components/ColoredPrice';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { blockExplorer } from 'containers/Connector/Connector';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { selectMarginTransfers } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { ExternalLink } from 'styles/common';
import { timePresentation } from 'utils/formatters/date';
import { formatDollars } from 'utils/formatters/number';
import { truncateAddress } from 'utils/formatters/string';

type TransferProps = {
	isLoading: boolean;
	isLoaded: boolean;
};

const Transfers: FC<TransferProps> = ({ isLoading, isLoaded }) => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();
	const marginTransfers = useAppSelector(selectMarginTransfers);
	const columnsDeps = useMemo(() => [marginTransfers], [marginTransfers]);

	return (
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
					Cell: (cellProps: any) => {
						const formatOptions = {
							minDecimals: DEFAULT_CRYPTO_DECIMALS,
							isAssetPrice: true,
						};

						return (
							<ColoredPrice
								priceInfo={{
									price: cellProps.row.original.size,
									change: cellProps.row.original.action === 'deposit' ? 'up' : 'down',
								}}
							>
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
				{
					Header: <TableHeader>{t('futures.market.user.transfers.table.transaction')}</TableHeader>,
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

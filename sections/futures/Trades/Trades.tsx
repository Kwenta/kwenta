import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import Card from 'components/Card';
import { GridDivCenteredRow } from 'components/layout/grid';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { ETH_UNIT } from 'constants/network';
import { blockExplorer } from 'containers/Connector/Connector';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesTrade, PositionSide } from 'sdk/types/futures';
import { ExternalLink } from 'styles/common';
import { formatCryptoCurrency, formatDollars } from 'utils/formatters/number';

import { TradeStatus } from '../types';
import TimeDisplay from './TimeDisplay';

type TradesProps = {
	history: FuturesTrade[];
	isLoading: boolean;
	isLoaded: boolean;
	marketAsset: string;
};

const Trades: React.FC<TradesProps> = ({ history, isLoading, isLoaded, marketAsset }) => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();

	const isL2 = useIsL2();

	const historyData = React.useMemo(() => {
		return history.map((trade) => ({
			...trade,
			value: Number(trade?.price?.div(ETH_UNIT)),
			amount: Number(trade?.size.div(ETH_UNIT).abs()),
			time: Number(trade?.timestamp.mul(1000)),
			pnl: trade?.pnl.div(ETH_UNIT),
			feesPaid: trade?.feesPaid.div(ETH_UNIT),
			id: trade?.txnHash,
			asset: marketAsset,
			type: trade?.orderType,
			status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
		}));
	}, [history, marketAsset]);

	const columnsDeps = useMemo(() => [historyData], [historyData]);

	return (
		<Card>
			<Table
				highlightRowsOnHover
				columns={[
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
						accessor: 'time',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<GridDivCenteredRow>
								<TimeDisplay value={cellProps.value} />
							</GridDivCenteredRow>
						),
						width: 90,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.side')}</TableHeader>,
						accessor: 'side',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>
								<StyledPositionSide side={cellProps.value}>{cellProps.value}</StyledPositionSide>
							</>
						),
						width: 60,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.price')}</TableHeader>,
						accessor: 'value',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							const formatOptions = {
								sign: '$',
								minDecimals: DEFAULT_CRYPTO_DECIMALS,
								isAssetPrice: true,
							};
							return <>{formatDollars(cellProps.value, formatOptions)}</>;
						},
						width: 90,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.trade-size')}</TableHeader>,
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{formatCryptoCurrency(cellProps.value)}</>
						),
						width: 90,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.fees')}</TableHeader>,
						sortType: 'basic',
						accessor: 'feesPaid',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{cellProps.value.eq(0) ? '--' : formatDollars(cellProps.value)}</>
						),
						width: 90,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.order-type')}</TableHeader>,
						accessor: 'type',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => <>{cellProps.value}</>,
						width: 100,
					},
					{
						accessor: 'txnHash',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<StyledExternalLink href={blockExplorer.txLink(cellProps.value)}>
								<StyledLinkIcon />
							</StyledExternalLink>
						),
						width: 25,
						sortable: false,
					},
				]}
				columnsDeps={columnsDeps}
				data={historyData}
				isLoading={isLoading && isLoaded}
				noResultsMessage={
					!isL2 ? (
						<TableNoResults>
							{t('common.l2-cta')}
							<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
						</TableNoResults>
					) : isLoaded && historyData?.length === 0 ? (
						<TableNoResults>{t('futures.market.user.trades.table.no-results')}</TableNoResults>
					) : undefined
				}
				showPagination
				pageSize={5}
			/>
		</Card>
	);
};

export default Trades;

const StyledPositionSide = styled.div<{ side: PositionSide }>`
	text-transform: uppercase;
	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.selectedTheme.green};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}
`;

const StyledExternalLink = styled(ExternalLink)`
	padding: 10px;
	&:hover {
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
			}
		}
	}
`;

const StyledLinkIcon = styled(LinkIcon)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	width: 14px;
	height: 14px;

	path {
		fill: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

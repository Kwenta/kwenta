import { wei } from '@synthetixio/wei';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import Card from 'components/Card';
import Table, { TableNoResults } from 'components/Table';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { ETH_UNIT } from 'constants/network';
import BlockExplorer from 'containers/BlockExplorer';
import { FuturesTrade } from 'queries/futures/types';
import { ExternalLink, GridDivCenteredRow } from 'styles/common';
import { formatCryptoCurrency, formatDollars } from 'utils/formatters/number';
import { isDecimalFour } from 'utils/futures';

import { PositionSide, TradeStatus } from '../types';
import TimeDisplay from './TimeDisplay';

type TradesProps = {
	history: FuturesTrade[] | [];
	isLoading: boolean;
	isLoaded: boolean;
	marketAsset: string;
};

const Trades: React.FC<TradesProps> = ({ history, isLoading, isLoaded, marketAsset }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const historyData = React.useMemo(() => {
		return history.map((trade: FuturesTrade) => {
			return {
				...trade,
				value: Number(trade?.price?.div(ETH_UNIT)),
				amount: Number(trade?.size.div(ETH_UNIT).abs()),
				time: Number(trade?.timestamp.mul(1000)),
				pnl: trade?.pnl.div(ETH_UNIT),
				feesPaid: trade?.feesPaid.div(ETH_UNIT),
				id: trade?.txnHash,
				asset: marketAsset,
				type: trade?.orderType === 'NextPrice' ? 'Next Price' : trade?.orderType,
				status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			};
		});
	}, [history, marketAsset]);

	const columnsDeps = useMemo(() => [historyData], [historyData]);

	return (
		<Card>
			<StyledTable
				columns={[
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.date')}</StyledTableHeader>
						),
						accessor: 'time',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<GridDivCenteredRow>
								<TimeDisplay cellPropsValue={cellProps.value} />
							</GridDivCenteredRow>
						),
						width: 90,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.side')}</StyledTableHeader>
						),
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
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.price')}</StyledTableHeader>
						),
						accessor: 'value',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => {
							const formatOptions = isDecimalFour(cellProps.row.original.asset)
								? { sign: '$', minDecimals: DEFAULT_CRYPTO_DECIMALS }
								: { sign: '$' };
							return <>{formatDollars(cellProps.value, formatOptions)}</>;
						},
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.trade-size')}
							</StyledTableHeader>
						),
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{formatCryptoCurrency(cellProps.value)}</>
						),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.pnl')}</StyledTableHeader>
						),
						accessor: 'pnl',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) =>
							cellProps.row.original.pnl.eq(wei(0)) ? (
								<PNL normal>--</PNL>
							) : (
								<PNL negative={cellProps.value.lt(wei(0))}>{formatDollars(cellProps.value)}</PNL>
							),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.fees')}</StyledTableHeader>
						),
						sortType: 'basic',
						accessor: 'feesPaid',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{cellProps.value.eq(0) ? '--' : formatDollars(cellProps.value)}</>
						),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.order-type')}
							</StyledTableHeader>
						),
						accessor: 'type',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => <>{cellProps.value}</>,
						width: 100,
					},
					{
						accessor: 'txnHash',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<StyledExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
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
					isLoaded && historyData?.length === 0 ? (
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

const StyledTable = styled(Table)``;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

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

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text
			: props.negative
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.green};
`;

const StyledExternalLink = styled(ExternalLink)`
	padding: 10px;
	&:hover {
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.button.text};
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import { GridDivCenteredRow } from 'components/layout/grid';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { ETH_UNIT } from 'constants/network';
import { FuturesTrade, PositionSide } from 'sdk/types/futures';
import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { TradeStatus } from 'sections/futures/types';
import { fetchTradesForSelectedMarket } from 'state/futures/actions';
import {
	selectFuturesType,
	selectMarketAsset,
	selectQueryStatuses,
	selectUsersTradesForMarket,
} from 'state/futures/selectors';
import { useAppSelector, useFetchAction } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { selectWallet } from 'state/wallet/selectors';
import { formatCryptoCurrency } from 'utils/formatters/number';

import TradeDrawer from '../drawers/TradeDrawer';

const TradesTab: React.FC = () => {
	const { t } = useTranslation();
	const walletAddress = useAppSelector(selectWallet);
	const marketAsset = useAppSelector(selectMarketAsset);
	const accountType = useAppSelector(selectFuturesType);
	const history = useAppSelector(selectUsersTradesForMarket);
	const { trades: tradesQuery } = useAppSelector(selectQueryStatuses);

	const [selectedTrade, setSelectedTrade] = React.useState<any>();

	useFetchAction(fetchTradesForSelectedMarket, {
		dependencies: [walletAddress, accountType, marketAsset],
		disabled: !walletAddress,
	});

	const historyData = React.useMemo(() => {
		return history.map((trade) => {
			const pnl = trade?.pnl.div(ETH_UNIT);
			const feesPaid = trade?.feesPaid.div(ETH_UNIT);
			const netPnl = pnl.sub(feesPaid);
			return {
				...trade,
				pnl,
				feesPaid,
				netPnl,
				value: Number(trade?.price?.div(ETH_UNIT)),
				amount: Number(trade?.size.div(ETH_UNIT).abs()),
				time: trade?.timestamp * 1000,
				id: trade?.txnHash,
				asset: marketAsset,
				type: trade?.orderType,
				status: trade.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			};
		});
	}, [history, marketAsset]);

	const columnsDeps = React.useMemo(() => [historyData], [historyData]);

	return (
		<div>
			<SectionHeader>
				<SectionTitle>{t('futures.market.user.trades.tab')}</SectionTitle>
			</SectionHeader>
			<Table
				onTableRowClick={(row) => {
					setSelectedTrade(row.original);
				}}
				columns={[
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
						accessor: 'timestamp',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<GridDivCenteredRow>
								<TimeDisplay value={cellProps.value} />
							</GridDivCenteredRow>
						),
						width: 80,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.side-type')}</TableHeader>,
						accessor: 'side',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<div>
								<StyledPositionSide side={cellProps.value}>{cellProps.value}</StyledPositionSide>
								<div>{cellProps.row.original.orderType}</div>
							</div>
						),
						width: 100,
						sortable: true,
					},
					{
						Header: <TableHeader>{t('futures.market.user.trades.table.trade-size')}</TableHeader>,
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{formatCryptoCurrency(cellProps.value, { suggestDecimals: true })}</>
						),
						width: 80,
						sortable: true,
					},
				]}
				columnsDeps={columnsDeps}
				data={historyData}
				isLoading={tradesQuery.status === FetchStatus.Loading}
				noResultsMessage={
					tradesQuery.status === FetchStatus.Success && historyData?.length === 0 ? (
						<TableNoResults>{t('futures.market.user.trades.table.no-results')}</TableNoResults>
					) : undefined
				}
				showPagination
				pageSize={5}
			/>

			<TradeDrawer trade={selectedTrade} closeDrawer={() => setSelectedTrade(undefined)} />
		</div>
	);
};

export default TradesTab;

const StyledPositionSide = styled.div<{ side: PositionSide }>`
	text-transform: uppercase;
	font-weight: bold;
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

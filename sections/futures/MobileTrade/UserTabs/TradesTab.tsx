import { utils as ethersUtils } from 'ethers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Table, { TableNoResults } from 'components/Table';
import { ETH_UNIT } from 'constants/network';
import Connector from 'containers/Connector';
import { FuturesTrade } from 'queries/futures/types';
import useGetFuturesTradesForAccount from 'queries/futures/useGetFuturesTradesForAccount';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { PositionSide, TradeStatus } from 'sections/futures/types';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { GridDivCenteredRow } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { FuturesMarketAsset, getMarketName } from 'utils/futures';

import { SectionHeader, SectionTitle } from '../common';
import TradeDrawer from '../drawers/TradeDrawer';

const TradesTab: React.FC = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const marketAsset = useAppSelector(selectMarketAsset);

	const [selectedTrade, setSelectedTrade] = React.useState<any>();

	const futuresTradesQuery = useGetFuturesTradesForAccount(marketAsset, walletAddress);

	const { isLoading, isFetched: isLoaded } = futuresTradesQuery;

	const history = React.useMemo(() => futuresTradesQuery?.data ?? [], [futuresTradesQuery.data]);

	const historyData = React.useMemo(() => {
		return history.map((trade) => {
			const parsedAsset = ethersUtils.parseBytes32String(trade.asset) as FuturesMarketAsset;
			return {
				...trade,
				asset: parsedAsset,
				market: getMarketName(parsedAsset),
				price: Number(trade.price?.div(ETH_UNIT)),
				size: Number(trade.size.div(ETH_UNIT).abs()),
				timestamp: Number(trade.timestamp.mul(1000)),
				pnl: trade.pnl.div(ETH_UNIT),
				feesPaid: trade.feesPaid.div(ETH_UNIT),
				id: trade.txnHash,
				status: trade.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			};
		});
	}, [history]);

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
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.date')}</StyledTableHeader>
						),
						accessor: 'timestamp',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<GridDivCenteredRow>
								<TimeDisplay value={cellProps.value} />
							</GridDivCenteredRow>
						),
						width: 70,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.side-type')}
							</StyledTableHeader>
						),
						accessor: 'side',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<div>
								<StyledPositionSide side={cellProps.value}>{cellProps.value}</StyledPositionSide>
								<div>{cellProps.row.original.orderType}</div>
							</div>
						),
						width: 60,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.trade-size')}
							</StyledTableHeader>
						),
						accessor: 'size',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{formatCryptoCurrency(cellProps.value)}</>
						),
						width: 80,
						sortable: true,
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

			<TradeDrawer trade={selectedTrade} closeDrawer={() => setSelectedTrade(undefined)} />
		</div>
	);
};

export default TradesTab;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

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

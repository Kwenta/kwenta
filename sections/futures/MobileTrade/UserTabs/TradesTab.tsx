import React from 'react';
import styled, { css } from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { ETH_UNIT } from 'constants/network';
import { FuturesTrade } from 'queries/futures/types';
import useGetFuturesTradesForAccount from 'queries/futures/useGetFuturesTradesForAccount';
import { currentMarketState, futuresAccountState } from 'store/futures';
import { GridDivCenteredRow } from 'styles/common';
import Table from 'components/Table';
import { PositionSide, TradeStatus } from 'sections/futures/types';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { CellProps } from 'react-table';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TradeDrawer from '../drawers/TradeDrawer';
import { SectionHeader, SectionTitle } from '../common';

const TradesTab: React.FC = () => {
	const { t } = useTranslation();
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const marketAsset = useRecoilValue(currentMarketState);

	const [selectedTrade, setSelectedTrade] = React.useState<any>();

	const futuresTradesQuery = useGetFuturesTradesForAccount(marketAsset, selectedFuturesAddress);

	const { isLoading, isFetched: isLoaded } = futuresTradesQuery;

	const history: FuturesTrade[] = React.useMemo(
		() => (futuresTradesQuery.isSuccess ? futuresTradesQuery?.data ?? [] : []),
		[futuresTradesQuery.isSuccess, futuresTradesQuery.data]
	);

	const historyData = React.useMemo(() => {
		return history.map((trade: FuturesTrade) => ({
			value: Number(trade?.price?.div(ETH_UNIT)),
			amount: Number(trade?.size.div(ETH_UNIT).abs()),
			time: Number(trade?.timestamp.mul(1000)),
			pnl: trade?.pnl.div(ETH_UNIT),
			feesPaid: trade?.feesPaid.div(ETH_UNIT),
			id: trade?.txnHash,
			asset: marketAsset,
			type: trade?.orderType === 'NextPrice' ? 'Next Price' : trade?.orderType,
			status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			side: trade?.side,
		}));
	}, [history, marketAsset]);

	const columnsDeps = React.useMemo(() => [historyData], [historyData]);

	return (
		<div>
			<SectionHeader>
				<SectionTitle>Trades</SectionTitle>
			</SectionHeader>
			<StyledTable
				palette="primary"
				onTableRowClick={(row) => {
					setSelectedTrade(row.original);
				}}
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
						width: 70,
						sortable: true,
					},
					{
						Header: <StyledTableHeader>Side/Type</StyledTableHeader>,
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
						accessor: 'amount',
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
				showPagination={true}
				pageSize={5}
			/>

			<TradeDrawer trade={selectedTrade} closeDrawer={() => setSelectedTrade(undefined)} />
		</div>
	);
};

export default TradesTab;

const StyledTable = styled(Table)``;

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
			color: ${props.theme.colors.common.primaryGreen};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
		`}
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 16px;
`;

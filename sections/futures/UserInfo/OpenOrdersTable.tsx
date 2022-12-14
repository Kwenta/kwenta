import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Badge from 'components/Badge';
import Currency from 'components/Currency';
import { MiniLoader } from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import { DEFAULT_DELAYED_EXECUTION_BUFFER } from 'constants/defaults';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { PositionSide } from 'queries/futures/types';
import { DelayedOrder } from 'sdk/types/futures';
import { cancelDelayedOrder, executeDelayedOrder } from 'state/futures/actions';
import { selectMarketAsset, selectMarkets, selectOpenOrders } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatTimer } from 'utils/formatters/date';
import { formatCurrency, formatDollars, suggestedDecimals } from 'utils/formatters/number';
import { FuturesMarketKey, getDisplayAsset } from 'utils/futures';

import OrderDrawer from '../MobileTrade/drawers/OrderDrawer';

type CountdownTimers = Record<
	FuturesMarketKey,
	{
		timeToExecution: number;
		timePastExecution: number;
	}
>;

const OpenOrdersTable: React.FC = () => {
	const { t } = useTranslation();
	const { switchToL2 } = useNetworkSwitcher();
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	const futuresMarkets = useAppSelector(selectMarkets);

	const isL2 = useIsL2();
	const openOrders = useAppSelector(selectOpenOrders);

	const [cancelling, setCancelling] = useState<string | null>(null);
	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>();
	const [selectedOrder, setSelectedOrder] = useState<DelayedOrder | undefined>();

	const rowsData = useMemo(() => {
		const ordersWithCancel = openOrders
			.map((o) => {
				const market = futuresMarkets.find((m) => m.market === o.marketAddress);
				const asset = o?.asset ?? '';
				const timer = countdownTimers && o.marketKey ? countdownTimers[o.marketKey] : null;
				const order = {
					...o,
					sizeTxt: formatCurrency(asset, o.size.abs(), {
						currencyKey: getDisplayAsset(asset) ?? '',
						minDecimals: suggestedDecimals(o.size),
					}),
					timeToExecution: timer?.timeToExecution,
					timePastExecution: timer?.timePastExecution,
					show: !!timer,
					isStale:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution > market.settings.maxDelayTimeDelta,
					isExecutable:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution <= market.settings.offchainDelayedOrderMaxAge,
					totalDeposit: o.commitDeposit.add(o.keeperDeposit),
					onCancel: () => {
						dispatch(
							cancelDelayedOrder({
								marketAddress: o.marketAddress,
								isOffchain: o.isOffchain,
							})
						);
					},
					onExecute: () => {
						dispatch(executeDelayedOrder(o.marketAddress));
					},
				};
				return order;
			})
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1;
			});
		return ordersWithCancel;
	}, [openOrders, futuresMarkets, marketAsset, countdownTimers, dispatch]);

	useEffect(() => {
		const timer = setInterval(() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution =
					Math.floor((order.executableAtTimestamp - Date.now()) / 1000) +
					DEFAULT_DELAYED_EXECUTION_BUFFER;
				const timePastExecution = Math.floor((Date.now() - order.executableAtTimestamp) / 1000);

				// Only updated delayed orders
				if (!order.isOffchain && order.marketKey) {
					acc[order.marketKey] = {
						timeToExecution: Math.max(timeToExecution, 0),
						timePastExecution: Math.max(timePastExecution, 0),
					};
				}
				return acc;
			}, {} as CountdownTimers);
			setCountdownTimers(newCountdownTimers);
		}, 1000);

		return () => clearTimeout(timer);
	});

	return (
		<>
			<DesktopOnlyView>
				<StyledTable
					data={rowsData}
					highlightRowsOnHover
					showPagination
					noResultsMessage={
						!isL2 ? (
							<TableNoResults>
								{t('common.l2-cta')}
								<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
							</TableNoResults>
						) : (
							<TableNoResults>
								{t('futures.market.user.open-orders.table.no-result')}
							</TableNoResults>
						)
					}
					columns={[
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.market-type')}
								</StyledTableHeader>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<MarketContainer>
										<IconContainer>
											<StyledCurrencyIcon currencyKey={cellProps.row.original.marketKey} />
										</IconContainer>
										<StyledText>
											{cellProps.row.original.market}
											{/* TODO: Do we enable this expired badge?
											{cellProps.row.original.isStale && (
												<ExpiredBadge color="red">
													{t('futures.market.user.open-orders.badges.expired')}
												</ExpiredBadge>
											)} */}
										</StyledText>
										<StyledValue>{cellProps.row.original.orderType}</StyledValue>
									</MarketContainer>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.side')}
								</StyledTableHeader>
							),
							accessor: 'side',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<PositionType side={cellProps.row.original.side} />
									</div>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.size')}
								</StyledTableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>{cellProps.row.original.sizeTxt}</div>
									</div>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.commit-deposit')}
								</StyledTableHeader>
							),
							accessor: 'marginDelta',
							Cell: (cellProps: CellProps<any>) => {
								const { totalDeposit } = cellProps.row.original;
								return <div>{formatDollars(totalDeposit?.gt(0) ? totalDeposit : '0')}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.actions')}
								</StyledTableHeader>
							),
							accessor: 'actions',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div style={{ display: 'flex' }}>
										<CancelButton onClick={cellProps.row.original.onCancel}>
											{t('futures.market.user.open-orders.actions.cancel')}
										</CancelButton>
										{cellProps.row.original.show && !cellProps.row.original.isStale && (
											<EditButton
												disabled={!cellProps.row.original.isExecutable}
												onClick={cellProps.row.original.onExecute}
											>
												{cellProps.row.original.isExecutable ? (
													t('futures.market.user.open-orders.actions.execute')
												) : !!cellProps.row.original.timeToExecution &&
												  cellProps.row.original.timeToExecution >= 0 ? (
													formatTimer(cellProps.row.original.timeToExecution)
												) : (
													<MiniLoader centered />
												)}
											</EditButton>
										)}
									</div>
								);
							},
							width: 50,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={rowsData}
					noResultsMessage={
						!isL2 ? (
							<TableNoResults>
								{t('common.l2-cta')}
								<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
							</TableNoResults>
						) : (
							<TableNoResults>
								{t('futures.market.user.open-orders.table.no-result')}
							</TableNoResults>
						)
					}
					onTableRowClick={(row) => setSelectedOrder(row.original)}
					columns={[
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.side-type')}
								</StyledTableHeader>
							),
							accessor: 'side/type',
							Cell: (cellProps: CellProps<any>) => (
								<div>
									<MobilePositionSide $side={cellProps.row.original.side}>
										{cellProps.row.original.side}
									</MobilePositionSide>
									<div>{cellProps.row.original.orderType}</div>
								</div>
							),
							width: 100,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.size')}
								</StyledTableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>{cellProps.row.original.sizeTxt}</div>
									</div>
								);
							},
						},
					]}
				/>

				<OrderDrawer
					open={!!selectedOrder}
					order={selectedOrder}
					closeDrawer={() => setSelectedOrder(undefined)}
				/>
			</MobileOrTabletView>
		</>
	);
};

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.gray};
	height: 28px;
	min-width: 72px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
`;

const CancelButton = styled(EditButton)`
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	color: ${(props) => props.theme.colors.selectedTheme.red};
	margin-right: 8px;
`;

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
`;

const MobilePositionSide = styled.div<{ $side: PositionSide }>`
	text-transform: uppercase;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.bold};
	letter-spacing: 1.4px;
	margin-bottom: 4px;

	${(props) =>
		props.$side === 'long' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.green};
		`};

	${(props) =>
		props.$side === 'short' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.red};
		`};
`;

export default OpenOrdersTable;

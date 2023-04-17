import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Table, { TableHeader, TableNoResults } from 'components/Table';
import {
	DEFAULT_DELAYED_CANCEL_BUFFER,
	DEFAULT_DELAYED_EXECUTION_BUFFER,
} from 'constants/defaults';
import useInterval from 'hooks/useInterval';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { FuturesMarketKey, PositionSide } from 'sdk/types/futures';
import { cancelDelayedOrder, executeDelayedOrder } from 'state/futures/actions';
import { selectOpenDelayedOrders, selectMarketAsset, selectMarkets } from 'state/futures/selectors';
import { DelayedOrderWithDetails } from 'state/futures/types';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatCurrency, suggestedDecimals } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import OrderDrawer from '../drawers/OrderDrawer';

type CountdownTimers = Record<
	FuturesMarketKey,
	{ timeToExecution: number; timePastExecution: number }
>;

const OrdersTab: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();
	const isL2 = useIsL2();

	const marketAsset = useAppSelector(selectMarketAsset);
	// TODO: Requires changes to bring back support for cross margin
	const openDelayedOrders = useAppSelector(selectOpenDelayedOrders);
	const futuresMarkets = useAppSelector(selectMarkets);

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>();
	const [selectedOrder, setSelectedOrder] = useState<DelayedOrderWithDetails | undefined>();

	const rowsData = useMemo(() => {
		const ordersWithCancel = openDelayedOrders
			.map((o) => {
				const market = futuresMarkets.find((m) => m.market === o.marketAddress);
				const timer = countdownTimers ? countdownTimers[o.marketKey] : null;
				const order = {
					...o,
					sizeTxt: formatCurrency(o.asset, o.size.abs(), {
						currencyKey: getDisplayAsset(o.asset) ?? '',
						minDecimals: suggestedDecimals(o.size),
					}),
					timeToExecution: timer?.timeToExecution,
					timePastExecution: timer?.timePastExecution,
					show: !!timer,
					isStale:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_CANCEL_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMaxAge
									: market.settings.maxDelayTimeDelta),
					isFailed:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_EXECUTION_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMinAge
									: market.settings.minDelayTimeDelta),
					isExecutable:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution <=
							(o.isOffchain
								? market.settings.offchainDelayedOrderMaxAge
								: market.settings.maxDelayTimeDelta),
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
						dispatch(
							executeDelayedOrder({
								marketKey: o.marketKey,
								marketAddress: o.marketAddress,
								isOffchain: o.isOffchain,
							})
						);
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
	}, [openDelayedOrders, futuresMarkets, marketAsset, countdownTimers, dispatch]);

	useInterval(
		() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution = Math.floor((order.executableAtTimestamp - Date.now()) / 1000);
				const timePastExecution = Math.floor((Date.now() - order.executableAtTimestamp) / 1000);

				// Only updated delayed orders
				acc[order.marketKey] = {
					timeToExecution: Math.max(timeToExecution, 0),
					timePastExecution: Math.max(timePastExecution, 0),
				};
				return acc;
			}, {} as CountdownTimers);
			setCountdownTimers(newCountdownTimers);
		},
		1000,
		[rowsData]
	);

	return (
		<div>
			{!isL2 ? (
				<TableNoResults style={{ marginTop: '16px' }}>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			) : rowsData.length === 0 ? (
				<TableNoResults style={{ marginTop: '16px' }}>
					{t('futures.market.user.open-orders.table.no-result')}
				</TableNoResults>
			) : (
				<StyledTable
					data={rowsData}
					rounded={false}
					onTableRowClick={(row) => setSelectedOrder(row.original)}
					columns={[
						{
							Header: (
								<TableHeader>{t('futures.market.user.open-orders.table.side-type')}</TableHeader>
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
							Header: <TableHeader>{t('futures.market.user.open-orders.table.size')}</TableHeader>,
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
			)}
			{selectedOrder && (
				<OrderDrawer
					open={!!selectedOrder}
					order={selectedOrder}
					closeDrawer={() => setSelectedOrder(undefined)}
				/>
			)}
		</div>
	);
};

const StyledTable = styled(Table)`
	margin-bottom: 20px;
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

export default OrdersTab;

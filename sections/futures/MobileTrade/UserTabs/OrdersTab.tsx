import { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { FlexDiv } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import { TableNoResults } from 'components/Table';
import { Body } from 'components/Text';
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
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	// TODO: Requires changes to bring back support for cross margin
	const openDelayedOrders = useAppSelector(selectOpenDelayedOrders);
	const futuresMarkets = useAppSelector(selectMarkets);

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>();

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
		<OrdersTabContainer>
			{rowsData.length === 0 ? (
				<TableNoResults>You have no open orders</TableNoResults>
			) : (
				rowsData.map((order) => (
					<OrderItem>
						<OrderMeta $side={order.side}>
							<FlexDiv>
								<div className="position-side-bar" />
								<div>
									<Body>{order.market}</Body>
									<Body capitalized color="secondary">
										{/*accountType === 'isolated_margin' ? 'Isolated Margin' : 'Cross-Margin'*/}
									</Body>
								</div>
							</FlexDiv>
							<FlexDiv>
								<Pill>Cancel</Pill>
								<Spacer width={10} />
								<Pill>Edit</Pill>
							</FlexDiv>
						</OrderMeta>
						<OrderRow>
							<Body color="secondary">Size</Body>
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Side</Body>
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Status</Body>
						</OrderRow>
					</OrderItem>
				))
			)}
		</OrdersTabContainer>
	);
};

const OrdersTabContainer = styled.div`
	padding-top: 15px;
`;

const OrderMeta = styled.div<{ $side: PositionSide }>`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;

	.position-side-bar {
		height: 100%;
		width: 4px;
		margin-right: 8px;
		background-color: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.text[
				props.$side === PositionSide.LONG ? 'positive' : 'negative'
			]};
	}
`;

const OrderItem = styled.div`
	margin: 0 20px;
	padding: 20px 0;

	&:not(:last-of-type) {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
`;

const OrderRow = styled.div`
	display: flex;
	justify-content: space-between;

	&:not(:last-of-type) {
		margin-bottom: 10px;
	}
`;

export default OrdersTab;

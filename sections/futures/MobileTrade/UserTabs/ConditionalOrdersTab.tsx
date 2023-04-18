import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { FlexDiv } from 'components/layout/flex';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import { TableNoResults } from 'components/Table';
import { Body } from 'components/Text';
import { PositionSide } from 'sdk/types/futures';
import PositionType from 'sections/futures/PositionType';
import { cancelConditionalOrder } from 'state/futures/actions';
import {
	selectAllConditionalOrders,
	selectCancellingConditionalOrder,
	selectMarketAsset,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

const ConditionalOrdersTab: React.FC = () => {
	const dispatch = useAppDispatch();

	const marketAsset = useAppSelector(selectMarketAsset);
	const openConditionalOrders = useAppSelector(selectAllConditionalOrders);
	const isCancellingOrder = useAppSelector(selectCancellingConditionalOrder);

	const cancelOrder = useCallback(
		(orderId: number) => () => {
			dispatch(cancelConditionalOrder(orderId));
		},
		[dispatch]
	);

	const rows = useMemo(() => {
		const ordersWithCancel = openConditionalOrders.sort((a, b) => {
			return b.asset === marketAsset && a.asset !== marketAsset
				? 1
				: b.asset === marketAsset && a.asset === marketAsset
				? 0
				: -1;
		});
		const cancellingIndex = ordersWithCancel.findIndex((o) => o.id === isCancellingOrder);
		ordersWithCancel[cancellingIndex] = {
			...ordersWithCancel[cancellingIndex],
			isCancelling: true,
		};
		return ordersWithCancel;
	}, [openConditionalOrders, isCancellingOrder, marketAsset]);

	return (
		<OrdersTabContainer>
			{rows.length === 0 ? (
				<TableNoResults>You have no open orders</TableNoResults>
			) : (
				rows.map((order) => (
					<OrderItem>
						<OrderMeta $side={order.side!}>
							<FlexDiv>
								<div className="position-side-bar" />
								<div>
									<Body>{order.market}</Body>
									<Body capitalized color="secondary">
										{order.orderTypeDisplay}
									</Body>
								</div>
							</FlexDiv>
							<FlexDiv>
								<Pill size="medium" color="red" onClick={cancelOrder(order.id)}>
									Cancel
								</Pill>
								<Spacer width={10} />
								<Pill size="medium">Edit</Pill>
							</FlexDiv>
						</OrderMeta>
						<OrderRow>
							<Body color="secondary">Size</Body>
							<Body>{order.sizeTxt}</Body>
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Reduce Only</Body>
							<Body>{order.reduceOnly ? 'Yes' : 'No'}</Body>
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Side</Body>
							<PositionType side={order.side!} />
						</OrderRow>
						<OrderRow>
							<Body color="secondary">CL Price</Body>
							<Currency.Price price={order.targetPrice} />
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Reserved Margin</Body>
							<Body mono>{formatDollars(order.marginDelta?.gt(0) ? order.marginDelta : '0')}</Body>
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

export default ConditionalOrdersTab;

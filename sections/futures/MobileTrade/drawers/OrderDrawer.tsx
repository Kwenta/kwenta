import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import { FuturesOrder, PositionSide } from 'queries/futures/types';
import { getDisplayAsset } from 'utils/futures';

import BaseDrawer from './BaseDrawer';

type OrderDrawerProps = {
	open: boolean;
	order: FuturesOrder | undefined;
	closeDrawer(): void;
	onExecute(): void;
	onCancel(order: FuturesOrder | undefined): void;
};

const OrderDrawer: React.FC<OrderDrawerProps> = ({
	open,
	order,
	closeDrawer,
	onCancel,
	onExecute,
}) => {
	const { t } = useTranslation();

	const items = React.useMemo(() => {
		if (!order || !order.side) return [];

		const price = order.targetPrice
			? [
					{
						label: t('futures.market.user.open-orders.table.price'),
						value: order.targetPriceTxt,
					},
			  ]
			: [];

		return [
			{
				label: t('futures.market.user.open-orders.table.market'),
				value: getDisplayAsset(order.asset),
			},
			{
				label: t('futures.market.user.open-orders.table.side'),
				value: <StyledPositionSide side={order.side}>{order.side}</StyledPositionSide>,
			},
			{
				label: t('futures.market.user.open-orders.table.size'),
				value: order.sizeTxt,
			},
			...price,
			{
				label: t('futures.market.user.open-orders.table.type'),
				value: order.orderType,
			},
		];
	}, [t, order]);

	return (
		<BaseDrawer
			open={open}
			closeDrawer={closeDrawer}
			items={items}
			buttons={
				<>
					{order?.isExecutable && (
						<ExecuteButton onClick={() => onExecute()}>Execute</ExecuteButton>
					)}
					<CancelOrderButton onClick={() => onCancel(order)}>Cancel</CancelOrderButton>
				</>
			}
		/>
	);
};

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

const ExecuteButton = styled(Button)`
	margin-right: 10px;
	height: 41px;
	flex: 1;
`;

const CancelOrderButton = styled(Button)`
	font-size: 16px;
	height: 41px;
	text-align: center;
	white-space: normal;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid #ef6868;
	box-shadow: none;
	transition: all 0s ease-in-out;
	flex: 1;

	&:hover {
		background: ${(props) => props.theme.colors.common.primaryRed};
		color: ${(props) => props.theme.colors.white};
		transform: scale(0.98);
	}

	&:disabled {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
	}
`;

export default OrderDrawer;

import React from 'react';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import { PositionSide } from 'sections/futures/types';
import { getDisplayAsset } from 'utils/futures';

import BaseDrawer from './BaseDrawer';

type OrderDrawerProps = {
	open: boolean;
	order: any;
	closeDrawer(): void;
	setAction(action: 'execute' | 'cancel'): void;
};

const OrderDrawer: React.FC<OrderDrawerProps> = ({ open, order, closeDrawer, setAction }) => {
	const items = React.useMemo(() => {
		if (!order) return [];

		return [
			{
				label: 'Market',
				value: getDisplayAsset(order.asset),
			},
			{
				label: 'Side',
				value: <StyledPositionSide side={order.side}>{order.side}</StyledPositionSide>,
			},
			{
				label: 'Size',
				value: order.size,
			},
			{
				label: 'Type',
				value: order.orderType,
			},
		];
	}, [order]);

	return (
		<BaseDrawer
			open={open}
			closeDrawer={closeDrawer}
			items={items}
			buttons={
				<>
					{order?.isExecutable && (
						<ExecuteButton onClick={() => setAction('execute')}>Execute</ExecuteButton>
					)}
					<CancelOrderButton onClick={() => setAction('cancel')}>Cancel</CancelOrderButton>
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

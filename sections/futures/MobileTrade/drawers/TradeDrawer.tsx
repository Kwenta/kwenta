import React from 'react';
import styled, { css } from 'styled-components';

import { PositionSide } from 'queries/futures/types';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { formatCryptoCurrency, formatDollars } from 'utils/formatters/number';

import BaseDrawer from './BaseDrawer';

type TradeDrawerProps = {
	trade?: any;
	closeDrawer(): void;
};

const TradeDrawer: React.FC<TradeDrawerProps> = ({ trade, closeDrawer }) => {
	const drawerItems = React.useMemo(() => {
		if (!trade) return [];

		return [
			{
				label: 'Market',
				value: trade.market,
			},
			{
				label: 'Side',
				value: <StyledPositionSide side={trade.side}>{trade.side}</StyledPositionSide>,
			},
			{
				label: 'Type',
				value: trade.orderType,
			},
			{
				label: 'Status',
				value: trade.status,
			},
			{ label: 'Size', value: formatCryptoCurrency(trade.size) },
			{
				label: 'Price',
				value: formatDollars(trade.price),
			},
			{ label: 'Date/Time', value: <TimeDisplay value={trade.timestamp} horizontal /> },
			{
				label: 'PnL',
				value: trade.pnl.eq(0) ? (
					<PNL normal>--</PNL>
				) : (
					<PNL negative={trade.pnl.lt(0)}>{formatDollars(trade.pnl)}</PNL>
				),
			},
			{
				label: 'Fees',
				value: trade.feesPaid.eq(0) ? '--' : formatDollars(trade.feesPaid),
			},
		];
	}, [trade]);

	return <BaseDrawer open={!!trade} closeDrawer={closeDrawer} items={drawerItems} />;
};

const StyledPositionSide = styled.div<{ side?: PositionSide | null }>`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.bold};

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

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
	color: ${(props) =>
		props.normal
			? props.theme.colors.common.primaryWhite
			: props.negative
			? props.theme.colors.common.primaryRed
			: props.theme.colors.common.primaryGreen};
`;

export default TradeDrawer;

import React from 'react';
import styled, { css } from 'styled-components';

import { PositionSide } from '@kwenta/sdk/types';
import { formatCryptoCurrency, formatDollars } from '@kwenta/sdk/utils';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';

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
				value: trade.market.marketName,
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
			{ label: 'Size', value: formatCryptoCurrency(trade.amount, { suggestDecimals: true }) },
			{
				label: 'Price',
				value: formatDollars(trade.value, { suggestDecimals: true }),
			},
			{ label: 'Date/Time', value: <TimeDisplay value={trade.time} horizontal /> },
			{
				label: 'PnL',
				value: trade.netPnl.eq(0) ? (
					<PNL normal>--</PNL>
				) : (
					<PNL negative={trade.netPnl.lt(0)}>{formatDollars(trade.netPnl)}</PNL>
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

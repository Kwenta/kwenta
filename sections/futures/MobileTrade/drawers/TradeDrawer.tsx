import { wei } from '@synthetixio/wei';
import React from 'react';
import styled, { css } from 'styled-components';

import { PositionSide } from 'queries/futures/types';
import TimeDisplay from 'sections/futures/Trades/TimeDisplay';
import { formatCryptoCurrency, formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

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
				value: getDisplayAsset(trade.asset),
			},
			{
				label: 'Side',
				value: <StyledPositionSide side={trade.side}>{trade.side}</StyledPositionSide>,
			},
			{
				label: 'Type',
				value: trade.type,
			},
			{
				label: 'Status',
				value: trade.status,
			},
			{ label: 'Size', value: formatCryptoCurrency(trade.amount) },
			{
				label: 'Price',
				value: formatCurrency('sUSD', trade.value, {
					sign: '$',
				}),
			},
			{ label: 'Date/Time', value: <TimeDisplay cellPropsValue={trade.time} horizontal /> },
			{
				label: 'PnL',
				value: trade.pnl.eq(wei(0)) ? (
					<PNL normal>--</PNL>
				) : (
					<PNL negative={trade.pnl.lt(wei(0))}>
						{formatCurrency('sUSD', trade.pnl, {
							sign: '$',
						})}
					</PNL>
				),
			},
			{
				label: 'Fees',
				value: trade.feesPaid.eq(0)
					? '--'
					: formatCurrency('sUSD', trade.feesPaid, {
							sign: '$',
					  }),
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

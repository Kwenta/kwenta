import { wei } from '@synthetixio/wei';
import LinkIcon from 'assets/svg/app/link.svg';
import Card from 'components/Card';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Table from 'components/Table';
import { Synths } from 'constants/currency';
import { ETH_UNIT } from 'constants/network';
import BlockExplorer from 'containers/BlockExplorer';
import { format } from 'date-fns';
import { FuturesTrade } from 'queries/futures/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';
import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';
import { formatCryptoCurrency, formatCurrency } from 'utils/formatters/number';

import { PositionSide, TradeStatus } from '../types';

type TradesProps = {
	history: FuturesTrade[] | [];
	isLoading: boolean;
	isLoaded: boolean;
	marketAsset: string;
};

const Trades: React.FC<TradesProps> = ({ history, isLoading, isLoaded, marketAsset }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();
	console.log(marketAsset);

	const historyData = history.map((trade: FuturesTrade) => {
		return {
			...trade,
			value: Number(trade?.price?.div(ETH_UNIT)),
			amount: Number(trade?.size.div(ETH_UNIT).abs()),
			time: Number(trade?.timestamp),
			id: trade?.txnHash,
			asset: marketAsset,
		};
	});

	console.log(historyData);

	const columnsDeps = useMemo(() => [historyData], [historyData]);
	// console.log(history);
	// const returnStatusSVG = (status: TradeStatus) => {
	// 	switch (status) {
	// 		case TradeStatus.OPEN:
	// 			return <StatusIcon status={status} src={PendingIcon} />;
	// 		case TradeStatus.CLOSED:
	// 			return <StatusIcon status={status} src={SuccessIcon} />;
	// 		case TradeStatus.LIQUIDATED:
	// 			return <StatusIcon status={status} src={FailureIcon} />;
	// 	}
	// };

	// const getStatus = (cellProps: CellProps<FuturesTrade>) => {
	// 	const { isOpen, isLiquidated } = cellProps.row.original;
	// 	return isLiquidated ? TradeStatus.LIQUIDATED : isOpen ? TradeStatus.OPEN : TradeStatus.CLOSED;
	// };

	// const priceDescription = (cellProps: CellProps<FuturesTrade>) => {
	// 	switch (getStatus(cellProps)) {
	// 		case TradeStatus.OPEN:
	// 			return (
	// 				<PriceDescription type="entry">
	// 					{t('futures.market.user.trades.table.trade-type.entry')}
	// 				</PriceDescription>
	// 			);
	// 		case TradeStatus.CLOSED:
	// 			return (
	// 				<PriceDescription type="exit">
	// 					{t('futures.market.user.trades.table.trade-type.exit')}
	// 				</PriceDescription>
	// 			);
	// 		case TradeStatus.LIQUIDATED:
	// 			return (
	// 				<PriceDescription type="liquidated">
	// 					{t('futures.market.user.trades.table.trade-type.liquidated')}
	// 				</PriceDescription>
	// 			);
	// 		default:
	// 			return null;
	// 	}
	// };

	// Date/Time
	// Market
	// Side
	// Trigger Price // we dont have this yet
	// Fill Price //
	// Position Size
	// Realized PnL
	// Fees paid
	// Type (Next-Price, Market, Limit, etc.)
	// Status
	// Next Trade, market, liquidation

	return (
		<Card>
			<StyledTable
				palette="primary"
				columns={[
					// {
					// 	Header: (
					// 		<StyledTableHeader>{t('futures.market.user.trades.table.id')}</StyledTableHeader>
					// 	),
					// 	accessor: 'id',
					// 	Cell: (cellProps: CellProps<FuturesTrade>) => <StyledId>{cellProps.value}</StyledId>,
					// 	sortable: true,
					// 	width: 50,
					// },
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.date')}</StyledTableHeader>
						),
						accessor: 'time',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								<div>{format(new Date(cellProps.value), 'MM-dd-yy')}</div>
								<div>{format(new Date(cellProps.value), 'HH:mm:ssaa')}</div>
							</FlexDivCentered>
						),
						width: 150,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.position')}
							</StyledTableHeader>
						),
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								{/* <CurrencyIcon currencyKey={cellProps.row.original.asset ?? ''} /> */}
								<StyledPositionSize>{formatCryptoCurrency(cellProps.value)}</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 100,
						sortable: true,
					},
					// {
					// 	Header: (
					// 		<StyledTableHeader>
					// 			{t('futures.market.user.trades.table.leverage')}
					// 		</StyledTableHeader>
					// 	),
					// 	accessor: 'leverage',
					// 	sortType: 'basic',
					// 	Cell: (cellProps: CellProps<FuturesTrade>) => (
					// 		<FlexDivCentered>
					// 			<LeverageSize>{formatNumber(cellProps.value)}x |</LeverageSize>
					// 			<LeverageSide side={cellProps.row.original.side}>
					// 				{cellProps.row.original.side}
					// 			</LeverageSide>
					// 		</FlexDivCentered>
					// 	),
					// 	width: 100,
					// 	sortable: true,
					// },
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.price')}</StyledTableHeader>
						),
						accessor: 'value',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>
								<Price>
									{formatCurrency(Synths.sUSD, cellProps.value, {
										sign: '$',
									})}
								</Price>
								{/* {priceDescription(cellProps)} */}
							</>
						),
						width: 100,
						sortable: true,
					},
					// {
					// 	Header: (
					// 		<StyledTableHeader>{t('futures.market.user.trades.table.final')}</StyledTableHeader>
					// 	),
					// 	accessor: 'exitPrice',
					// 	sortType: 'basic',
					// 	Cell: (cellProps: CellProps<FuturesTrade>) => (
					// 		<Price>
					// 			{cellProps.row.original.isOpen
					// 				? '--'
					// 				: formatCurrency(Synths.sUSD, cellProps.value, {
					// 						sign: '$',
					// 				  })}
					// 		</Price>
					// 	),
					// 	width: 100,
					// 	sortable: true,
					// },
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.pnl')}</StyledTableHeader>
						),
						accessor: 'pnl',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) =>
							cellProps.row.original.size.gt(wei(0)) ? (
								<PNL negative={cellProps.value.lt(wei(0))}>
									{formatCurrency(Synths.sUSD, cellProps.value, {
										sign: '$',
									})}
								</PNL>
							) : (
								<PNL normal={true}>--</PNL>
							),
						width: 100,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.fees')}</StyledTableHeader>
						),
						sortType: 'basic',
						accessor: 'feesPaid',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>
								{cellProps.value.eq(0)
									? '--'
									: formatCurrency(Synths.sUSD, cellProps.value, {
											sign: '$',
									  })}
							</>
						),
						sortable: false,
						width: 100,
					},
					// {
					// 	Header: (
					// 		<StyledTableHeader>{t('futures.market.user.trades.table.status')}</StyledTableHeader>
					// 	),
					// 	id: 'status',
					// 	sortType: 'basic',
					// 	Cell: (cellProps: CellProps<FuturesTrade>) => {
					// 		return (
					// 			<FlexDivCentered>
					// 				{/* {returnStatusSVG(status)} */}
					// 				<StatusText>{getStatus(cellProps)}</StatusText>
					// 			</FlexDivCentered>
					// 		);
					// 	},
					// 	width: 100,
					// 	sortable: true,
					// },
					{
						accessor: 'txnHash',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<StyledExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
								<StyledLinkIcon
									src={LinkIcon}
									viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`}
								/>
							</StyledExternalLink>
						),
						sortable: false,
						width: 25,
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
			/>
		</Card>
	);
};
export default Trades;

const BoldTableText = css`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;
`;

const StyledTable = styled(Table)``;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

const PriceDescription = styled.span<{ type: string }>`
	font-size: 10px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 2px;
`;

const StyledId = styled.div`
	${BoldTableText}
`;

const StyledPositionSize = styled.div`
	margin-left: 4px;
	${BoldTableText}
	text-transform: none;
`;

const LeverageSize = styled.div`
	${BoldTableText}
`;

const LeverageSide = styled.div<{ side: PositionSide }>`
${BoldTableText}
  color: ${(props) =>
		props.side === PositionSide.LONG ? props.theme.colors.green : props.theme.colors.red};
  margin-left: 4px;
	text-transform: uppercase;
`;

const Price = styled.div`
	${BoldTableText};
`;

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
	${BoldTableText};
	color: ${(props) =>
		props.normal
			? props.theme.colors.common.primaryWhite
			: props.negative
			? props.theme.colors.common.primaryRed
			: props.theme.colors.common.primaryGreen};
`;

const StatusText = styled.div`
	${BoldTableText};
	margin-left: 4px;
`;

const StatusIcon = styled(Svg)<{ status: TradeStatus }>`
	color: ${(props) =>
		props.status === TradeStatus.OPEN
			? props.theme.colors.yellow
			: props.status === TradeStatus.CLOSED
			? props.theme.colors.green
			: props.theme.colors.red};
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

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

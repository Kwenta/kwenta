import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { wei } from '@synthetixio/wei';

import Card from 'components/Card';
import Table from 'components/Table';
import BlockExplorer from 'containers/BlockExplorer';
import { ExternalLink, FlexDivCentered, GridDivCenteredRow } from 'styles/common';

import NoNotificationIcon from 'assets/svg/app/no-notifications.svg';
import LinkIcon from 'assets/svg/app/link.svg';
import { TradeStatus, PositionSide } from '../types';
import { Synths } from 'constants/currency';
import CurrencyIcon from 'components/Currency/CurrencyIcon';

import PendingIcon from 'assets/svg/app/circle-ellipsis.svg';
import FailureIcon from 'assets/svg/app/circle-error.svg';
import SuccessIcon from 'assets/svg/app/circle-tick.svg';
import { formatCurrency, formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { FuturesTrade } from 'queries/futures/types';
import { format } from 'date-fns';
import useGetFuturesTrades from 'queries/futures/useGetFuturesTrades';

type TradesProps = {
	marketAsset: string;
};

const Trades: React.FC<TradesProps> = ({ marketAsset }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = BlockExplorer.useContainer();

	const futuresTradesQuery = useGetFuturesTrades(marketAsset);

	let history = useMemo(() => {
		const futuresTrades = futuresTradesQuery?.data ?? [];
		return futuresTrades.length > 0
			? futuresTrades.map((trade: FuturesTrade) => {
					return {
						value: Number(trade?.price),
						amount: Number(trade?.size),
						time: Number(trade?.timestamp),
						id: trade?.txnHash,
						marketAsset,
					};
			  })
			: [];
	}, [futuresTradesQuery.data, marketAsset]);

	const columnsDeps = useMemo(() => [history], [history]);
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
						accessor: 'timestamp',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								{format(new Date(cellProps.value), 'MM-dd-yy')}
								{format(new Date(cellProps.value), 'HH:mm:ssaa')}
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
						accessor: 'size',
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
						accessor: 'price',
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
						accessor: 'transactionHash',
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
				data={history}
				isLoading={futuresTradesQuery.isLoading && futuresTradesQuery.isFetched}
				noResultsMessage={
					futuresTradesQuery.isFetched && history?.length === 0 ? (
						<TableNoResults>
							<Svg src={NoNotificationIcon} />
							{t('dashboard.transactions.table.no-results')}
						</TableNoResults>
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

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	text-transform: capitalize;
`;

const PriceDescription = styled.span<{ type: string }>`
	font-size: 10px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 2px;

	/* color: ${(props) =>
		props.type === 'entry'
			? props.theme.colors.common.primaryWhite
			: props.type === 'exit'
			? props.theme.colors.common.secondaryGray
			: props.type === 'liquidated'
			? props.theme.colors.common.secondaryGray
			: props.theme.colors.common.primaryWhite}; */
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
	background-color: ${(props) => props.theme.colors.elderberry};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
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

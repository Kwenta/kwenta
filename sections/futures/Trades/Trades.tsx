import { wei } from '@synthetixio/wei';
import LinkIcon from 'assets/svg/app/link.svg';
import Card from 'components/Card';
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

	const historyData = React.useMemo(() => {
		return history.map((trade: FuturesTrade) => {
			return {
				...trade,
				value: Number(trade?.price?.div(ETH_UNIT)),
				amount: Number(trade?.size.div(ETH_UNIT).abs()),
				time: Number(trade?.timestamp.mul(1000)),
				pnl: trade?.pnl.div(ETH_UNIT),
				feesPaid: trade?.feesPaid.div(ETH_UNIT),
				id: trade?.txnHash,
				asset: marketAsset,
				type: trade?.orderType === 'NextPrice' ? 'Next Price' : trade?.orderType,
				status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			};
		});
	}, [history, marketAsset]);

	const columnsDeps = useMemo(() => [historyData], [historyData]);

	const getStatus = (status: string) => {
		switch (status) {
			case TradeStatus.OPEN:
				return (
					<StyledStatus status={status}>
						{t('futures.market.user.trades.table.trade-types.entry')}
					</StyledStatus>
				);
			case TradeStatus.CLOSED:
				return (
					<StyledStatus status={status}>
						{t('futures.market.user.trades.table.trade-types.exit')}
					</StyledStatus>
				);
			case TradeStatus.LIQUIDATED:
				return (
					<StyledStatus status={status}>
						{t('futures.market.user.trades.table.trade-types.liquidated')}
					</StyledStatus>
				);
			default:
				return null;
		}
	};

	return (
		<Card>
			<StyledTable
				palette="primary"
				columns={[
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.date')}</StyledTableHeader>
						),
						accessor: 'time',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<GridDivCenteredRow>
								<div>{format(new Date(cellProps.value), 'MM-dd-yy')}</div>
								<div>{format(new Date(cellProps.value), 'HH:mm:ssaa')}</div>
							</GridDivCenteredRow>
						),
						width: 90,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.side')}</StyledTableHeader>
						),
						accessor: 'side',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								<StyledPositionSide side={cellProps.value}>{cellProps.value}</StyledPositionSide>
							</FlexDivCentered>
						),
						width: 60,
						sortable: true,
					},
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
							</>
						),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.trade-size')}
							</StyledTableHeader>
						),
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								<StyledPositionSize>{formatCryptoCurrency(cellProps.value)}</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>{t('futures.market.user.trades.table.pnl')}</StyledTableHeader>
						),
						accessor: 'pnl',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) =>
							cellProps.row.original.pnl.eq(wei(0)) ? (
								<PNL normal={true}>--</PNL>
							) : (
								<PNL negative={cellProps.value.lt(wei(0))}>
									{formatCurrency(Synths.sUSD, cellProps.value, {
										sign: '$',
									})}
								</PNL>
							),
						width: 80,
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
						width: 80,
						sortable: true,
					},
					{
						Header: (
							<StyledTableHeader>
								{t('futures.market.user.trades.table.order-type')}
							</StyledTableHeader>
						),
						accessor: 'type',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<FlexDivCentered>
								{/* <CurrencyIcon currencyKey={cellProps.row.original.asset ?? ''} /> */}
								<StyledPositionSize>{cellProps.value}</StyledPositionSize>
							</FlexDivCentered>
						),
						width: 100,
					},
					// {
					// 	Header: (
					// 		<StyledTableHeader>{t('futures.market.user.trades.table.status')}</StyledTableHeader>
					// 	),
					// 	id: 'status',
					// 	accessor: 'status',
					// 	sortType: 'basic',
					// 	Cell: (cellProps: CellProps<FuturesTrade>) => {
					// 		return (
					// 			<FlexDivCentered>
					// 				<StatusText>{getStatus(cellProps.value)}</StatusText>
					// 			</FlexDivCentered>
					// 		);
					// 	},
					// 	width: 100,
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
						width: 25,
						sortable: false,
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
				pageSize={5}
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

const StyledStatus = styled.span<{ status: string }>`
	font-size: 10px;
	color: ${(props) =>
		props.status === TradeStatus.OPEN
			? props.theme.colors.yellow
			: props.status === TradeStatus.CLOSED
			? props.theme.colors.white
			: props.theme.colors.red};
	font-family: ${(props) => props.theme.fonts.bold};
	margin-left: 2px;
	text-transform: uppercase;
`;

const StyledPositionSize = styled.div`
	margin-left: 4px;
	${BoldTableText}
	text-transform: none;
`;

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

const StatusText = styled.div`
	${BoldTableText};
	margin-left: 4px;
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
`;

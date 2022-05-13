import { wei } from '@synthetixio/wei';
import LinkIcon from 'assets/svg/app/link.svg';
import Card from 'components/Card';
import Table from 'components/Table';
import TimeDisplay from './TimeDisplay';
import { Synths } from 'constants/currency';
import { ETH_UNIT } from 'constants/network';
import BlockExplorer from 'containers/BlockExplorer';
import { FuturesTrade } from 'queries/futures/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';
import { ExternalLink, GridDivCenteredRow } from 'styles/common';
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

	/* const getStatus = (status: string) => {
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
	};*/

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
								<TimeDisplay cellPropsValue={cellProps.value} />
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
							<>
								<StyledPositionSide side={cellProps.value}>{cellProps.value}</StyledPositionSide>
							</>
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
								{formatCurrency(Synths.sUSD, cellProps.value, {
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
								{t('futures.market.user.trades.table.trade-size')}
							</StyledTableHeader>
						),
						accessor: 'amount',
						sortType: 'basic',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<>{formatCryptoCurrency(cellProps.value)}</>
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
							<>
								{/* <CurrencyIcon currencyKey={cellProps.row.original.asset ?? ''} /> */}
								{cellProps.value}
							</>
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
					// 			<>
					// 				<StatusText>{getStatus(cellProps.value)}</StatusText>
					// 			</>
					// 		);
					// 	},
					// 	width: 100,
					// },
					{
						accessor: 'txnHash',
						Cell: (cellProps: CellProps<FuturesTrade>) => (
							<StyledExternalLink href={blockExplorerInstance?.txLink(cellProps.value)}>
								<StyledLinkIcon />
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

const StyledTable = styled(Table)``;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
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

/* 
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

const StatusText = styled.div`
	${BoldTableText};
	margin-left: 4px;
`;
*/

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
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

const StyledLinkIcon = styled(LinkIcon)`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	width: 14px;
	height: 14px;
`;

import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import { Checkbox } from 'components/Checkbox';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import useGetFuturesOrders from 'queries/futures/useGetFuturesOrders';
import { currentMarketState, futuresAccountState, marketInfoState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { formatCurrency } from 'utils/formatters/number';
import {
	getDisplayAsset,
	MarketKeyByAsset,
	FuturesMarketAsset,
	getMarketName,
} from 'utils/futures';

import OrderDrawer from '../MobileTrade/drawers/OrderDrawer';
import { PositionSide } from '../types';

const OrderHistory: React.FC = () => {
	const { t } = useTranslation();
	const [openFilter, setOpenFilter] = useState(true);

	const { synthsMap } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();

	const gasSpeed = useRecoilValue(gasSpeedState);
	const currencyKey = useRecoilValue(currentMarketState);
	const marketInfo = useRecoilValue(marketInfoState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const { handleRefetch } = useRefetchContext();

	const [action, setAction] = React.useState<'' | 'cancel' | 'execute'>('');
	const [selectedOrder, setSelectedOrder] = React.useState<any>();

	const ethGasPriceQuery = useEthGasPriceQuery();
	const orderQuery = useGetFuturesOrders();
	const orders = useMemo(() => orderQuery?.data ?? [], [orderQuery?.data]);

	const gasPrice = ethGasPriceQuery.data?.[gasSpeed];

	const cancelOrExecuteOrderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(currencyKey)}`,
		`${action}NextPriceOrder`,
		[selectedFuturesAddress],
		gasPrice,
		{
			enabled: !!action,
			onSettled: () => {
				setAction('');
			},
		}
	);

	React.useEffect(() => {
		if (!!action) {
			cancelOrExecuteOrderTxn.mutate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action]);

	React.useEffect(() => {
		if (cancelOrExecuteOrderTxn.hash) {
			monitorTransaction({
				txHash: cancelOrExecuteOrderTxn.hash,
				onTxConfirmed: () => {
					handleRefetch('new-order');
				},
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cancelOrExecuteOrderTxn.hash]);

	const data = React.useMemo(() => {
		return orders
			.map((order: any) => ({
				...order,
				status:
					wei(marketInfo?.currentRoundId ?? 0).gte(wei(order.targetRoundId).add(2)) &&
					order.status === 'Pending'
						? 'Expired'
						: order.status,
				market: getMarketName(order.asset),
				marketKey: MarketKeyByAsset[order.asset as FuturesMarketAsset],
				orderType: order.orderType === 'NextPrice' ? 'Next-Price' : order.orderType,
				size: formatCurrency(order.asset, order.size.abs(), {
					sign: order.asset ? synthsMap[order.asset]?.sign : '',
				}),
				side: wei(order.size).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
				isFilled: order.status === 'Filled',
				isExecutable:
					order.status === 'Pending' &&
					(wei(marketInfo?.currentRoundId ?? 0).eq(order.targetRoundId) ||
						wei(marketInfo?.currentRoundId ?? 0).eq(order.targetRoundId.add(1))),
			}))
			.filter((order: any) => !openFilter || order.status === 'Pending');
	}, [orders, marketInfo?.currentRoundId, synthsMap, openFilter]);

	return (
		<>
			<DesktopOnlyView>
				<FilterContainer>
					<Checkbox
						id={'openFilter'}
						label={t('futures.market.user.open-orders.table.open-filter')}
						checked={openFilter}
						onChange={() => {
							setOpenFilter(!openFilter);
						}}
					/>
				</FilterContainer>
				<StyledTable
					data={data}
					highlightRowsOnHover
					showPagination
					pageSize={5}
					isLoading={orders.isLoading}
					noResultsMessage={
						<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
					}
					columns={[
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.market-type')}
								</StyledTableHeader>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<MarketContainer>
										<IconContainer>
											<StyledCurrencyIcon currencyKey={cellProps.row.original.marketKey} />
										</IconContainer>
										<StyledText>{cellProps.row.original.market}</StyledText>
										<StyledValue>{cellProps.row.original.orderType}</StyledValue>
									</MarketContainer>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.side')}
								</StyledTableHeader>
							),
							accessor: 'side',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<PositionType side={cellProps.row.original.side} />
									</div>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.size')}
								</StyledTableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return <div>{cellProps.row.original.size}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.status')}
								</StyledTableHeader>
							),
							accessor: 'status',
							Cell: (cellProps: CellProps<any>) => {
								return <div>{cellProps.row.original.status}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.actions')}
								</StyledTableHeader>
							),
							accessor: 'actions',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div style={{ display: 'flex' }}>
										{cellProps.row.original.isExecutable && (
											<CancelButton
												onClick={() => {
													setAction('cancel');
												}}
											>
												{t('futures.market.user.open-orders.actions.cancel')}
											</CancelButton>
										)}
										{cellProps.row.original.isExecutable && (
											<EditButton
												onClick={() => {
													setAction('execute');
												}}
											>
												{t('futures.market.user.open-orders.actions.execute')}
											</EditButton>
										)}
									</div>
								);
							},
							width: 50,
						},
					]}
				/>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<StyledTable
					data={data}
					noResultsMessage={
						<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
					}
					onTableRowClick={(row) => setSelectedOrder(row.original)}
					columns={[
						{
							Header: <StyledTableHeader>Side/Type</StyledTableHeader>,
							accessor: 'side/type',
							Cell: (cellProps: CellProps<any>) => (
								<div>
									<MobilePositionSide $side={cellProps.row.original.side}>
										{cellProps.row.original.side}
									</MobilePositionSide>
									<div>{cellProps.row.original.orderType}</div>
								</div>
							),
							width: 100,
						},
						{
							Header: <StyledTableHeader>Size</StyledTableHeader>,
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => <div>{cellProps.row.original.size}</div>,
						},
					]}
				/>

				<OrderDrawer
					open={!!selectedOrder}
					order={selectedOrder}
					closeDrawer={() => setSelectedOrder(undefined)}
					setAction={setAction}
				/>
			</MobileOrTabletView>
		</>
	);
};

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`;

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`;

const FilterContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	padding: 2px 0;
`;

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`;

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
	margin-bottom: -4px;
`;

const MarketContainer = styled.div`
	display: grid;
	grid-template-rows: auto auto;
	grid-template-columns: auto auto;
	align-items: center;
`;

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.gray};
	height: 28px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
`;

const CancelButton = styled(EditButton)`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	color: ${(props) => props.theme.colors.selectedTheme.red};
	margin-right: 8px;
`;

const MobilePositionSide = styled.div<{ $side: PositionSide }>`
	text-transform: uppercase;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.bold};
	letter-spacing: 1.4px;
	margin-bottom: 4px;

	${(props) =>
		props.$side === 'long' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.green};
		`};

	${(props) =>
		props.$side === 'short' &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.red};
		`};
`;

export default OrderHistory;

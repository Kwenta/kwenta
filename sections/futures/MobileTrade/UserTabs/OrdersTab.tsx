import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useRefetchContext } from 'contexts/RefetchContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import TransactionNotifier from 'containers/TransactionNotifier';
import { PositionSide } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import {
	positionState,
	currentMarketState,
	futuresAccountState,
	openOrdersState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import { SectionHeader, SectionTitle } from '../common';
import OrderDrawer from '../drawers/OrderDrawer';

const OrdersTab: React.FC = () => {
	const { t } = useTranslation();
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { useSynthetixTxn, useEthGasPriceQuery } = useSynthetixQueries();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const position = useRecoilValue(positionState);
	const currencyKey = useRecoilValue(currentMarketState);
	const openOrders = useRecoilValue(openOrdersState);

	const { handleRefetch } = useRefetchContext();

	const [selectedOrder, setSelectedOrder] = React.useState<any>();
	const [action, setAction] = React.useState<'cancel' | 'execute' | null>(null);

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrice = ethGasPriceQuery.data?.[gasSpeed];

	const nextPriceDetailsQuery = useGetNextPriceDetails();
	const nextPriceDetails = nextPriceDetailsQuery.data;

	const cancelOrExecuteOrderTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(currencyKey)}`,
		`${action}NextPriceOrder`,
		[selectedFuturesAddress],
		gasPrice,
		{
			enabled: !!action,
			onSettled: () => {
				setAction(null);
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
		const positionSize = position?.position?.notionalValue ?? wei(0);

		return openOrders.map((order: any) => ({
			asset: order.asset,
			market: getDisplayAsset(order.asset) + '-PERP',
			orderType: order.orderType === 'NextPrice' ? 'Next-Price' : order.orderType,
			size: order.size,
			side: positionSize.add(wei(order.size)).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			isStale: wei(nextPriceDetails?.currentRoundId ?? 0).gte(wei(order.targetRoundId).add(2)),
			isExecutable:
				wei(nextPriceDetails?.currentRoundId ?? 0).eq(order.targetRoundId) ||
				wei(nextPriceDetails?.currentRoundId ?? 0).eq(order.targetRoundId.add(1)),
			timestamp: order.timestamp,
		}));
	}, [openOrders, position, nextPriceDetails?.currentRoundId]);

	return (
		<div>
			<SectionHeader>
				<SectionTitle>Orders</SectionTitle>
			</SectionHeader>

			<StyledTable
				data={data}
				onTableRowClick={(row) => {
					setSelectedOrder(row.original);
				}}
				noResultsMessage={
					<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
				}
				columns={[
					{
						Header: <StyledTableHeader>Side/Type</StyledTableHeader>,
						accessor: 'side/type',
						Cell: (cellProps: CellProps<any>) => (
							<div>
								<PositionType side={cellProps.row.original.side} />
								<div>{cellProps.row.original.orderType}</div>
							</div>
						),
						width: 100,
					},
					{
						Header: <StyledTableHeader>Size</StyledTableHeader>,
						accessor: 'size',
						Cell: (cellProps: CellProps<any>) => (
							<div>
								{formatCurrency(cellProps.row.original.asset, cellProps.row.original.size, {
									sign: cellProps.row.original.asset,
								})}
							</div>
						),
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
									<CancelButton
										onClick={() => {
											setAction('cancel');
										}}
									>
										{t('futures.market.user.open-orders.actions.cancel')}
									</CancelButton>
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
						width: 100,
					},
				]}
			/>

			<OrderDrawer
				open={!!selectedOrder}
				order={selectedOrder}
				closeDrawer={() => setSelectedOrder(undefined)}
				setAction={setAction}
			/>
		</div>
	);
};

const StyledTable = styled(Table)``;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	text-transform: capitalize;
`;

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.common.secondaryGray};
	height: 28px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;
`;

const CancelButton = styled(EditButton)`
	border: 1px solid ${(props) => props.theme.colors.common.primaryRed};
	color: ${(props) => props.theme.colors.common.primaryRed};
	margin-right: 8px;
`;

export default OrdersTab;

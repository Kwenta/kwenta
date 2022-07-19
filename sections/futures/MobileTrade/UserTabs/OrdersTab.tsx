import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { CellProps } from 'react-table';
import { wei } from '@synthetixio/wei';

import TransactionNotifier from 'containers/TransactionNotifier';
import {
	positionState,
	currentMarketState,
	openOrdersState,
	futuresAccountState,
} from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';
import { SectionHeader, SectionTitle } from '../common';
import { PositionSide } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { useRefetchContext } from 'contexts/RefetchContext';
import Table from 'components/Table';
import PositionType from 'components/Text/PositionType';
import { formatCurrency } from 'utils/formatters/number';
import OrderDrawer from '../drawers/OrderDrawer';
import { GridDivCenteredRow } from 'styles/common';

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
				noResultsMessage={
					openOrders.length === 0 ? (
						<TableNoResults>You have no open orders.</TableNoResults>
					) : undefined
				}
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

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-size: 16px;
`;

export default OrdersTab;

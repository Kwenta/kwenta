import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Badge from 'components/Badge';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableNoResults } from 'components/Table';
import PositionType from 'components/Text/PositionType';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginContracts from 'hooks/useCrossMarginContracts';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { PositionSide } from 'queries/futures/types';
import { FuturesOrder } from 'sdk/types/futures';
import { selectMarketAsset, selectOpenOrders } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';
import logError from 'utils/logError';

import OrderDrawer from '../MobileTrade/drawers/OrderDrawer';

const OpenOrdersTable: React.FC = () => {
	const { t } = useTranslation();
	const { crossMarginAccountContract } = useCrossMarginContracts();
	const { handleRefetch } = useRefetchContext();
	const { switchToL2 } = useNetworkSwitcher();

	const marketAsset = useAppSelector(selectMarketAsset);

	const isL2 = useIsL2();
	const openOrders = useAppSelector(selectOpenOrders);

	const [cancelling, setCancelling] = useState<string | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<FuturesOrder | undefined>();

	const handleTx = useCallback(
		(txHash: string) => {
			monitorTransaction({
				txHash: txHash,
				onTxConfirmed: () => {
					handleRefetch('new-order');
				},
			});
		},
		[handleRefetch]
	);

	const onCancel = useCallback(
		async (order: FuturesOrder | undefined) => {
			if (!order) return;
			setCancelling(order.id);
			try {
				const id = order.id.split('-')[2];
				const tx = await crossMarginAccountContract?.cancelOrder(id);
				if (tx?.hash) handleTx(tx.hash);
				setCancelling(null);
			} catch (err) {
				setCancelling(null);
				logError(err);
			}
		},
		[crossMarginAccountContract, handleTx]
	);

	const rowsData = useMemo(() => {
		const ordersWithCancel = openOrders
			.map((o) => ({ ...o, cancel: () => onCancel(o) }))
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1;
			});
		const cancellingIndex = ordersWithCancel.findIndex((o) => o.id === cancelling);
		ordersWithCancel[cancellingIndex] = {
			...ordersWithCancel[cancellingIndex],
			isCancelling: true,
		};
		return ordersWithCancel;
	}, [openOrders, cancelling, marketAsset, onCancel]);

	return (
		<>
			<DesktopOnlyView>
				<StyledTable
					data={rowsData}
					highlightRowsOnHover
					showPagination
					noResultsMessage={
						!isL2 ? (
							<TableNoResults>
								{t('common.l2-cta')}
								<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
							</TableNoResults>
						) : (
							<TableNoResults>
								{t('futures.market.user.open-orders.table.no-result')}
							</TableNoResults>
						)
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
										<StyledText>
											{cellProps.row.original.market}
											{cellProps.row.original.isStale && (
												<ExpiredBadge color="red">
													{t('futures.market.user.open-orders.badges.expired')}
												</ExpiredBadge>
											)}
										</StyledText>
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
									{t('futures.market.user.open-orders.table.size-price')}
								</StyledTableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>{cellProps.row.original.sizeTxt}</div>
										{cellProps.row.original.targetPrice && (
											<Currency.Price
												currencyKey={'sUSD'}
												price={cellProps.row.original.targetPrice}
												sign={'$'}
												conversionRate={1}
											/>
										)}
									</div>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.reserved-margin')}
								</StyledTableHeader>
							),
							accessor: 'marginDelta',
							Cell: (cellProps: CellProps<any>) => {
								const { marginDelta } = cellProps.row.original;
								return <div>{formatDollars(marginDelta?.gt(0) ? marginDelta : '0')}</div>;
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
								const cancellingRow = cellProps.row.original.isCancelling;
								return (
									<div style={{ display: 'flex' }}>
										<CancelButton disabled={cancellingRow} onClick={cellProps.row.original.cancel}>
											{t('futures.market.user.open-orders.actions.cancel')}
										</CancelButton>
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
					data={openOrders}
					noResultsMessage={
						!isL2 ? (
							<TableNoResults>
								{t('common.l2-cta')}
								<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
							</TableNoResults>
						) : (
							<TableNoResults>
								{t('futures.market.user.open-orders.table.no-result')}
							</TableNoResults>
						)
					}
					onTableRowClick={(row) => setSelectedOrder(row.original)}
					columns={[
						{
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.side-type')}
								</StyledTableHeader>
							),
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
							Header: (
								<StyledTableHeader>
									{t('futures.market.user.open-orders.table.size-price')}
								</StyledTableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>{cellProps.row.original.sizeTxt}</div>
										{cellProps.row.original.targetPrice && (
											<Currency.Price
												currencyKey={'sUSD'}
												price={cellProps.row.original.targetPrice}
												sign={'$'}
												conversionRate={1}
											/>
										)}
									</div>
								);
							},
						},
					]}
				/>

				<OrderDrawer
					open={!!selectedOrder}
					order={selectedOrder}
					closeDrawer={() => setSelectedOrder(undefined)}
					onCancel={onCancel}
					onExecute={() => {}}
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
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	color: ${(props) => props.theme.colors.selectedTheme.red};
	margin-right: 8px;
`;

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
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

export default OpenOrdersTable;

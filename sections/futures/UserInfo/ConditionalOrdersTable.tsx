import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';

import Badge from 'components/Badge';
import Currency from 'components/Currency';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { ConditionalOrder, PositionSide } from 'sdk/types/futures';
import { cancelConditionalOrder } from 'state/futures/actions';
import {
	selectCancellingConditionalOrder,
	selectMarketAsset,
	selectConditionalOrdersForMarket,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import ConditionalOrderDrawer from '../MobileTrade/drawers/ConditionalOrderDrawer';
import PositionType from '../PositionType';
import TableMarketDetails from './TableMarketDetails';

export default function ConditionalOrdersTable() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();
	const isL2 = useIsL2();

	const marketAsset = useAppSelector(selectMarketAsset);
	const openConditionalOrders = useAppSelector(selectConditionalOrdersForMarket);
	const isCancellingOrder = useAppSelector(selectCancellingConditionalOrder);

	const [selectedOrder, setSelectedOrder] = useState<ConditionalOrder | undefined>();

	const rows = useMemo(() => {
		const ordersWithCancel = openConditionalOrders
			.map((o) => ({ ...o, cancel: () => dispatch(cancelConditionalOrder(o.id)) }))
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1;
			});
		const cancellingIndex = ordersWithCancel.findIndex((o) => o.id === isCancellingOrder);
		ordersWithCancel[cancellingIndex] = {
			...ordersWithCancel[cancellingIndex],
			isCancelling: true,
		};
		return ordersWithCancel;
	}, [openConditionalOrders, isCancellingOrder, marketAsset, dispatch]);

	return (
		<>
			<DesktopOnlyView>
				<StyledTable
					data={rows}
					highlightRowsOnHover
					rounded={false}
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
								<TableHeader>{t('futures.market.user.open-orders.table.market-type')}</TableHeader>
							),
							accessor: 'market',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<TableMarketDetails
										marketName={cellProps.row.original.market}
										infoLabel={cellProps.row.original.orderTypeDisplay}
										marketKey={cellProps.row.original.marketKey}
										badge={
											cellProps.row.original.isStale && (
												<ExpiredBadge color="red">
													{t('futures.market.user.open-orders.badges.expired')}
												</ExpiredBadge>
											)
										}
									/>
								);
							},
							sortable: true,
							width: 70,
						},
						{
							Header: <TableHeader>{t('futures.market.user.open-orders.table.side')}</TableHeader>,
							accessor: 'side',
							Cell: (cellProps: CellProps<any>) => {
								return <PositionType side={cellProps.row.original.side} />;
							},
							sortable: true,
							width: 40,
						},
						{
							Header: <TableHeader>{t('futures.market.user.open-orders.table.type')}</TableHeader>,
							accessor: 'type',
							Cell: (cellProps: CellProps<any>) => {
								return <div>{cellProps.row.original.orderTypeDisplay}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<TableHeader>{t('futures.market.user.open-orders.table.reduce-only')}</TableHeader>
							),
							accessor: 'reduceOnly',
							Cell: (cellProps: CellProps<any>) => {
								return <div>{cellProps.row.original.reduceOnly ? 'yes' : 'no'}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: <TableHeader>{t('futures.market.user.open-orders.table.size')}</TableHeader>,
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return <div>{cellProps.row.original.sizeTxt}</div>;
							},
							sortable: true,
							width: 50,
						},
						{
							Header: <TableHeader>{t('futures.market.user.open-orders.table.price')}</TableHeader>,
							accessor: 'price',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<Currency.Price price={cellProps.row.original.targetPrice} />
									</div>
								);
							},
							sortable: true,
							width: 50,
						},
						{
							Header: (
								<TableHeader>
									{t('futures.market.user.open-orders.table.reserved-margin')}
								</TableHeader>
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
								<TableHeader>{t('futures.market.user.open-orders.table.actions')}</TableHeader>
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
					data={openConditionalOrders}
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
								<TableHeader>{t('futures.market.user.open-orders.table.side-type')}</TableHeader>
							),
							accessor: 'side/type',
							Cell: (cellProps: CellProps<any>) => (
								<div>
									<MobilePositionSide $side={cellProps.row.original.side}>
										{cellProps.row.original.side}
									</MobilePositionSide>
									<div>{cellProps.row.original.orderTypeDisplay}</div>
								</div>
							),
							width: 100,
						},
						{
							Header: (
								<TableHeader>{t('futures.market.user.open-orders.table.size-price')}</TableHeader>
							),
							accessor: 'size',
							Cell: (cellProps: CellProps<any>) => {
								return (
									<div>
										<div>{cellProps.row.original.sizeTxt}</div>
										{cellProps.row.original.targetPrice && (
											<Currency.Price price={cellProps.row.original.targetPrice} />
										)}
									</div>
								);
							},
						},
					]}
				/>
				{selectedOrder && (
					<ConditionalOrderDrawer
						open={!!selectedOrder}
						order={selectedOrder}
						closeDrawer={() => setSelectedOrder(undefined)}
					/>
				)}
			</MobileOrTabletView>
		</>
	);
}

const StyledTable = styled(Table)`
	margin-bottom: 20px;
`;

const EditButton = styled.button`
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.gray};
	height: 28px;
	min-width: 72px;
	box-sizing: border-box;
	border-radius: 14px;
	cursor: pointer;
	background-color: transparent;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	padding-left: 12px;
	padding-right: 12px;

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.gray};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
`;

const CancelButton = styled(EditButton)`
	opacity: ${(props) => (props.disabled ? 0.4 : 1)};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	color: ${(props) => props.theme.colors.selectedTheme.red};

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.red};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}
`;

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
	margin-left: 5px;
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

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import Badge from 'components/Badge';
import ColoredPrice from 'components/ColoredPrice';
import Currency from 'components/Currency';
import Pill from 'components/Pill';
import Spacer from 'components/Spacer';
import Table, { TableHeader, TableNoResults } from 'components/Table';
import { NO_VALUE } from 'constants/placeholder';
import useIsL2 from 'hooks/useIsL2';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { setShowPositionModal } from 'state/app/reducer';
import { cancelConditionalOrder } from 'state/futures/actions';
import {
	selectCancellingConditionalOrder,
	selectMarketAsset,
	selectAllConditionalOrders,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';

import PositionType from '../PositionType';
import ConditionalOrdersWarning from './ConditionalOrdersWarning';
import TableMarketDetails from './TableMarketDetails';

export default function ConditionalOrdersTable() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();
	const isL2 = useIsL2();

	const marketAsset = useAppSelector(selectMarketAsset);
	const openConditionalOrders = useAppSelector(selectAllConditionalOrders);
	const isCancellingOrder = useAppSelector(selectCancellingConditionalOrder);

	const handleOpenEditModal = useCallback(() => {
		dispatch(
			setShowPositionModal({
				type: 'futures_edit_stop_loss_take_profit',
				marketKey: MarketKeyByAsset[marketAsset],
			})
		);
	}, [dispatch, marketAsset]);

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
		<Container>
			<ConditionalOrdersWarning />
			<Table
				data={rows}
				highlightRowsOnHover
				noBottom={true}
				rounded={false}
				noResultsMessage={
					!isL2 ? (
						<TableNoResults>
							{t('common.l2-cta')}
							<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
						</TableNoResults>
					) : (
						<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
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
						Header: (
							<TableHeader>{t('futures.market.user.open-orders.table.current-price')}</TableHeader>
						),
						accessor: 'clPrice',
						Cell: (cellProps: CellProps<any>) => {
							return cellProps.row.original.currentPrice ? (
								<div>
									<ColoredPrice priceInfo={cellProps.row.original.currentPrice}>
										{formatDollars(cellProps.row.original.currentPrice.price, {
											suggestDecimals: true,
										})}
									</ColoredPrice>
								</div>
							) : (
								NO_VALUE
							);
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
									<Currency.Price
										price={cellProps.row.original.targetPrice}
										formatOptions={{ suggestDecimals: true }}
									/>
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
						Header: <TableHeader>{t('futures.market.user.open-orders.table.actions')}</TableHeader>,
						accessor: 'actions',
						Cell: (cellProps: CellProps<any>) => {
							const cancellingRow = cellProps.row.original.isCancelling;
							return (
								<div style={{ display: 'flex' }}>
									<Pill
										color="red"
										size="medium"
										onClick={cellProps.row.original.cancel}
										disabled={cancellingRow}
									>
										{t('futures.market.user.open-orders.actions.cancel')}
									</Pill>
									<Spacer width={10} />
									<Pill size="medium" onClick={handleOpenEditModal}>
										{t('futures.market.user.open-orders.actions.edit')}
									</Pill>
								</div>
							);
						},
						width: 50,
					},
				]}
			/>
		</Container>
	);
}

const Container = styled.div`
	height: 100%;
	overflow: scroll;
`;

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
	margin-left: 5px;
`;

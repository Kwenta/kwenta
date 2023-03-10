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
	selectOpenConditionalOrders,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import ConditionalOrderDrawer from '../MobileTrade/drawers/ConditionalOrderDrawer';
import PositionType from '../PositionType';

export default function ConditionalOrdersTable() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { switchToL2 } = useNetworkSwitcher();
	const isL2 = useIsL2();

	const marketAsset = useAppSelector(selectMarketAsset);
	const openConditionalOrders = useAppSelector(selectOpenConditionalOrders);
	const isCancellingOrder = useAppSelector(selectCancellingConditionalOrder);

	const [selectedOrder, setSelectedOrder] = useState<ConditionalOrder | undefined>();

	const rows = useMemo(() => {
		const ordersWithCancel = openConditionalOrders
			.map((o) => ({ ...o, cancel: () => dispatch(cancelConditionalOrder(o.contractId)) }))
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1;
			});
		const cancellingIndex = ordersWithCancel.findIndex((o) => o.contractId === isCancellingOrder);
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
								<TableHeader>{t('futures.market.user.open-orders.table.market-type')}</TableHeader>
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
										<StyledValue>{cellProps.row.original.orderTypeDisplay}</StyledValue>
									</MarketContainer>
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
										<Currency.Price
											currencyKey={'sUSD'}
											price={cellProps.row.original.targetPrice}
											sign={'$'}
											conversionRate={1}
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

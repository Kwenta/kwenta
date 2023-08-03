import { PositionSide } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Badge from 'components/Badge'
import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import Pill from 'components/Pill'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import { CustomFontLabel } from 'components/Text/CustomFontLabel'
import { NO_VALUE } from 'constants/placeholder'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { cancelConditionalOrder } from 'state/futures/smartMargin/actions'
import {
	selectAllConditionalOrders,
	selectCancellingConditionalOrder,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PositionType from '../PositionType'

import ConditionalOrdersWarning from './ConditionalOrdersWarning'
import TableMarketDetails from './TableMarketDetails'

export default function ConditionalOrdersTable() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { switchToL2 } = useNetworkSwitcher()
	const isL2 = useIsL2()

	const marketAsset = useAppSelector(selectMarketAsset)
	const openConditionalOrders = useAppSelector(selectAllConditionalOrders)
	const isCancellingOrder = useAppSelector(selectCancellingConditionalOrder)

	const rows = useMemo(() => {
		const ordersWithCancel = openConditionalOrders
			.map((o) => ({ ...o, cancel: () => dispatch(cancelConditionalOrder(o.id)) }))
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1
			})
		const cancellingIndex = ordersWithCancel.findIndex((o) => o.id === isCancellingOrder)
		ordersWithCancel[cancellingIndex] = {
			...ordersWithCancel[cancellingIndex],
			isCancelling: true,
		}
		return ordersWithCancel
	}, [openConditionalOrders, isCancellingOrder, marketAsset, dispatch])

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
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.market-type')}</TableHeader>
						),
						accessorKey: 'market',
						cell: (cellProps) => {
							return (
								<TableMarketDetails
									marketName={cellProps.row.original.market}
									infoLabel={cellProps.row.original.orderTypeDisplay}
									marketKey={cellProps.row.original.marketKey}
									badge={
										cellProps.row.original.isStale ? (
											<ExpiredBadge color="red">
												{t('futures.market.user.open-orders.badges.expired')}
											</ExpiredBadge>
										) : undefined
									}
								/>
							)
						},
						enableSorting: true,
						size: 70,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.side')}</TableHeader>
						),
						accessorKey: 'side',
						cell: (cellProps) => {
							return <PositionType side={cellProps.row.original.side ?? PositionSide.LONG} />
						},
						enableSorting: true,
						size: 40,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.type')}</TableHeader>
						),
						accessorKey: 'type',
						cell: (cellProps) => {
							return <Body>{cellProps.row.original.orderTypeDisplay}</Body>
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.reduce-only')}</TableHeader>
						),
						accessorKey: 'reduceOnly',
						cell: (cellProps) => {
							return <Body>{cellProps.row.original.reduceOnly ? 'Yes' : 'No'}</Body>
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.size')}</TableHeader>
						),
						accessorKey: 'size',
						cell: (cellProps) => {
							return <CustomFontLabel text={cellProps.row.original.sizeTxt ?? NO_VALUE} />
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.current-price')}</TableHeader>
						),
						accessorKey: 'clPrice',
						cell: (cellProps) => {
							return cellProps.row.original.currentPrice ? (
								<div>
									<ColoredPrice priceChange={cellProps.row.original.currentPrice.change}>
										{formatDollars(cellProps.row.original.currentPrice.price, {
											suggestDecimals: true,
										})}
									</ColoredPrice>
								</div>
							) : (
								NO_VALUE
							)
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.price')}</TableHeader>
						),
						accessorKey: 'price',
						cell: (cellProps) => {
							return (
								<div>
									<Currency.Price
										price={cellProps.row.original.targetPrice}
										formatOptions={{ suggestDecimals: true }}
									/>
								</div>
							)
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>
								{t('futures.market.user.open-orders.table.reserved-margin')}
							</TableHeader>
						),
						accessorKey: 'marginDelta',
						cell: (cellProps) => {
							const { marginDelta } = cellProps.row.original
							return <div>{formatDollars(marginDelta?.gt(0) ? marginDelta : '0')}</div>
						},
						enableSorting: true,
						size: 50,
					},
					{
						header: () => (
							<TableHeader>{t('futures.market.user.open-orders.table.actions')}</TableHeader>
						),
						accessorKey: 'actions',
						cell: (cellProps) => {
							const cancellingRow = cellProps.row.original.isCancelling
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
								</div>
							)
						},
						size: 50,
					},
				]}
			/>
		</Container>
	)
}

const Container = styled.div`
	height: calc(100% - 40px);
	overflow: scroll;
`

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
	margin-left: 5px;
`

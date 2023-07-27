import { FuturesMarginType, FuturesMarketKey } from '@kwenta/sdk/types'
import { getDisplayAsset, formatCurrency, suggestedDecimals } from '@kwenta/sdk/utils'
import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Badge from 'components/Badge'
import { ButtonLoader } from 'components/Loader'
import Pill from 'components/Pill'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import { DEFAULT_DELAYED_CANCEL_BUFFER, DEFAULT_DELAYED_EXECUTION_BUFFER } from 'constants/defaults'
import useInterval from 'hooks/useInterval'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import { cancelDelayedOrder } from 'state/futures/actions'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { cancelAsyncOrder, executeAsyncOrder } from 'state/futures/crossMargin/actions'
import { selectAsyncCrossMarginOrders } from 'state/futures/crossMargin/selectors'
import { selectIsCancellingOrder, selectIsExecutingOrder } from 'state/futures/selectors'
import { executeDelayedOrder } from 'state/futures/smartMargin/actions'
import { selectSmartMarginDelayedOrders } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import PositionType from '../PositionType'

import TableMarketDetails from './TableMarketDetails'

type CountdownTimers = Record<
	FuturesMarketKey,
	{
		timeToExecution: number
		timePastExecution: number
	}
>

const OpenDelayedOrdersTable: React.FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { switchToL2 } = useNetworkSwitcher()
	const isL2 = useIsL2()

	const marketAsset = useAppSelector(selectMarketAsset)
	const smartMarginOrders = useAppSelector(selectSmartMarginDelayedOrders)
	const isCancelling = useAppSelector(selectIsCancellingOrder)
	const isExecuting = useAppSelector(selectIsExecutingOrder)
	const crossMarginOrders = useAppSelector(selectAsyncCrossMarginOrders)
	const futuresType = useAppSelector(selectFuturesType)

	const orders = useMemo(
		() => (futuresType === FuturesMarginType.CROSS_MARGIN ? crossMarginOrders : smartMarginOrders),
		[futuresType, crossMarginOrders, smartMarginOrders]
	)

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>()

	// TODO: Share logic between mobile and desktop

	const rowsData = useMemo(() => {
		const ordersWithCancel = orders
			.map((o) => {
				const timer = countdownTimers ? countdownTimers[o.market.marketKey] : null
				const order = {
					...o,
					sizeTxt: formatCurrency(o.market.asset, o.size.abs(), {
						currencyKey: getDisplayAsset(o.market.asset) ?? '',
						minDecimals: suggestedDecimals(o.size),
					}),
					timeToExecution: timer?.timeToExecution,
					timePastExecution: timer?.timePastExecution,
					show: !!timer,
					isStale:
						timer &&
						o.market.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution > DEFAULT_DELAYED_CANCEL_BUFFER + o.settlementWindowDuration,
					isFailed:
						timer &&
						o.market.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution > DEFAULT_DELAYED_EXECUTION_BUFFER,
					isExecutable:
						timer &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution <= o.settlementWindowDuration,
					totalDeposit: o.settlementFee,
					onCancel: () => {
						if (o.market.version === 2) {
							dispatch(cancelDelayedOrder(o.market.marketAddress))
						} else {
							dispatch(cancelAsyncOrder(o.market.marketId))
						}
					},
					onExecute: () => {
						if (o.market.version === 2) {
							dispatch(
								executeDelayedOrder({
									marketKey: o.market.marketKey,
									marketAddress: o.market.marketAddress,
								})
							)
						} else {
							dispatch(
								executeAsyncOrder({
									marketKey: o.market.marketKey,
									marketId: o.market.marketId,
								})
							)
						}
					},
				}
				return order
			})
			.sort((a, b) => {
				return b.market.asset === marketAsset && a.market.asset !== marketAsset
					? 1
					: b.market.asset === marketAsset && a.market.asset === marketAsset
					? 0
					: -1
			})
		return ordersWithCancel
	}, [orders, marketAsset, countdownTimers, dispatch])

	useInterval(
		() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution = Math.floor(order.executableStartTime - Date.now() / 1000)
				const timePastExecution = Math.floor(Date.now() / 1000 - order.executableStartTime)
				// console.log('Date.now()', Date.now())
				// console.log('order.executableStartTime', order.executableStartTime)
				// console.log('timePastExecution', timePastExecution)

				// Only updated delayed orders
				acc[order.market.marketKey] = {
					timeToExecution: Math.max(timeToExecution, 0),
					timePastExecution: Math.max(timePastExecution, 0),
				}
				return acc
			}, {} as CountdownTimers)
			setCountdownTimers(newCountdownTimers)
		},
		1000,
		[rowsData]
	)

	return (
		<Table
			data={rowsData}
			columnsDeps={[isCancelling, isExecuting]}
			highlightRowsOnHover
			showPagination
			rounded={false}
			noBottom={true}
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
								marketName={cellProps.row.original.market.marketName}
								infoLabel={'market'}
								marketKey={cellProps.row.original.market.marketKey}
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
					size: 60,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.open-orders.table.side')}</TableHeader>
					),
					accessorKey: 'side',
					cell: (cellProps) => {
						return (
							<div>
								<PositionType side={cellProps.row.original.side} />
							</div>
						)
					},
					enableSorting: true,
					size: 40,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.open-orders.table.size')}</TableHeader>
					),
					accessorKey: 'size',
					cell: (cellProps) => {
						return (
							<div>
								<div>{cellProps.row.original.sizeTxt}</div>
							</div>
						)
					},
					enableSorting: true,
					size: 50,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.open-orders.table.status')}</TableHeader>
					),
					accessorKey: 'status',
					cell: (cellProps) => {
						return (
							<div>
								{cellProps.row.original.show &&
									(cellProps.row.original.isStale ? (
										<Body color="negative">
											{t('futures.market.user.open-orders.status.expired')}
										</Body>
									) : cellProps.row.original.isFailed ? (
										<Body color="negative">
											{t('futures.market.user.open-orders.status.failed')}
										</Body>
									) : (
										<Body color="preview">
											{t('futures.market.user.open-orders.status.pending')}
										</Body>
									))}
							</div>
						)
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
						return (
							<div>
								{cellProps.row.original.show &&
									cellProps.row.original.isStale &&
									(isCancelling ? (
										<ButtonLoader />
									) : (
										<Pill size="medium" color="red" onClick={cellProps.row.original.onCancel}>
											{t('futures.market.user.open-orders.actions.cancel')}
										</Pill>
									))}
								{cellProps.row.original.show &&
									!cellProps.row.original.isStale &&
									cellProps.row.original.isFailed &&
									(isExecuting ? (
										<ButtonLoader />
									) : (
										<Pill size="medium" onClick={cellProps.row.original.onExecute}>
											{t('futures.market.user.open-orders.actions.execute')}
										</Pill>
									))}
							</div>
						)
					},
					size: 50,
				},
			]}
		/>
	)
})

const ExpiredBadge = styled(Badge)`
	background: ${(props) => props.theme.colors.selectedTheme.red};
	padding: 1px 5px;
	line-height: 9px;
	margin-left: 6px;
`

export default OpenDelayedOrdersTable

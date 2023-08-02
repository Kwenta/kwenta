import { FuturesMarginType, FuturesMarketKey, PositionSide } from '@kwenta/sdk/types'
import { getDisplayAsset, formatCurrency, suggestedDecimals } from '@kwenta/sdk/utils'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDiv } from 'components/layout/flex'
import Pill from 'components/Pill'
import Spacer from 'components/Spacer'
import { TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import { DEFAULT_DELAYED_CANCEL_BUFFER, DEFAULT_DELAYED_EXECUTION_BUFFER } from 'constants/defaults'
import useInterval from 'hooks/useInterval'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import PositionType from 'sections/futures/PositionType'
import { cancelDelayedOrder } from 'state/futures/actions'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { cancelAsyncOrder, executeAsyncOrder } from 'state/futures/crossMargin/actions'
import { selectAsyncCrossMarginOrders } from 'state/futures/crossMargin/selectors'
import { selectIsExecutingOrder, selectIsCancellingOrder } from 'state/futures/selectors'
import { executeDelayedOrder } from 'state/futures/smartMargin/actions'
import { selectSmartMarginDelayedOrders } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type CountdownTimers = Record<
	FuturesMarketKey,
	{ timeToExecution: number; timePastExecution: number }
>

const OrdersTab: React.FC = () => {
	const dispatch = useAppDispatch()
	const { t } = useTranslation()
	const { switchToL2 } = useNetworkSwitcher()
	const isL2 = useIsL2()

	const marketAsset = useAppSelector(selectMarketAsset)
	const smartMarginOrders = useAppSelector(selectSmartMarginDelayedOrders)
	const crossMarginOrders = useAppSelector(selectAsyncCrossMarginOrders)
	const isExecuting = useAppSelector(selectIsExecutingOrder)
	const futuresType = useAppSelector(selectFuturesType)
	const isCancelling = useAppSelector(selectIsCancellingOrder)

	const orders = useMemo(
		() => (futuresType === FuturesMarginType.CROSS_MARGIN ? crossMarginOrders : smartMarginOrders),
		[futuresType, crossMarginOrders, smartMarginOrders]
	)

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>()

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
	}, [marketAsset, countdownTimers, orders, dispatch])

	// TODO: Combine this with the one in OpenDelayedOrdersTable

	useInterval(
		() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution = Math.floor(order.executableStartTime - Date.now() / 1000)
				const timePastExecution = Math.floor(Date.now() / 1000 - order.executableStartTime)

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
		<OrdersTabContainer>
			{!isL2 ? (
				<TableNoResults>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			) : rowsData.length === 0 ? (
				<TableNoResults>{t('futures.market.user.open-orders.table.no-result')}</TableNoResults>
			) : (
				rowsData.map((order) => (
					<OrderItem>
						<OrderMeta $side={order.side}>
							<FlexDiv>
								<div className="position-side-bar" />
								<div>
									<Body>{order.market.marketName}</Body>
									<Body capitalized color="secondary">
										Market
									</Body>
								</div>
							</FlexDiv>
							<FlexDiv>
								{order.show && order.isStale && (
									<Pill
										size="medium"
										onClick={() => {
											if (order.market.version === 2) {
												dispatch(cancelDelayedOrder(order.market.marketAddress))
											} else {
												dispatch(cancelAsyncOrder(order.market.marketId))
											}
										}}
										disabled={isCancelling}
										color="red"
									>
										Cancel
									</Pill>
								)}
								{order.show && !order.isStale && order.isFailed && (
									<>
										<Spacer width={10} />
										<Pill
											size="medium"
											onClick={() => {
												if (order.market.version === 2) {
													dispatch(
														executeDelayedOrder({
															marketKey: order.market.marketKey,
															marketAddress: order.market.marketAddress,
														})
													)
												} else {
													dispatch(
														executeAsyncOrder({
															marketKey: order.market.marketKey,
															marketId: order.market.marketId,
														})
													)
												}
											}}
											disabled={isExecuting}
										>
											Execute
										</Pill>
									</>
								)}
							</FlexDiv>
						</OrderMeta>
						<OrderRow>
							<Body color="secondary">Size</Body>
							<Body mono>{order.sizeTxt}</Body>
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Side</Body>
							<PositionType side={order.side} />
						</OrderRow>
						<OrderRow>
							<Body color="secondary">Status</Body>
							<div>
								{order.show &&
									(order.isStale ? (
										<Body>{t('futures.market.user.open-orders.status.expired')}</Body>
									) : order.isFailed ? (
										<Body>{t('futures.market.user.open-orders.status.failed')}</Body>
									) : (
										<Body>{t('futures.market.user.open-orders.status.pending')}</Body>
									))}
							</div>
						</OrderRow>
					</OrderItem>
				))
			)}
		</OrdersTabContainer>
	)
}

const OrdersTabContainer = styled.div`
	padding-top: 15px;
`

const OrderMeta = styled.div<{ $side: PositionSide }>`
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;

	.position-side-bar {
		height: 100%;
		width: 4px;
		margin-right: 8px;
		background-color: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.text[
				props.$side === PositionSide.LONG ? 'positive' : 'negative'
			]};
	}
`

const OrderItem = styled.div`
	margin: 0 20px;
	padding: 20px 0;

	&:not(:last-of-type) {
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
`

const OrderRow = styled.div`
	display: flex;
	justify-content: space-between;

	&:not(:last-of-type) {
		margin-bottom: 10px;
	}
`

export default OrdersTab

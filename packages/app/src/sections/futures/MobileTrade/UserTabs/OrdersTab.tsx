import { FuturesMarketKey, PositionSide } from '@kwenta/sdk/types'
import { getDisplayAsset, formatCurrency, suggestedDecimals } from '@kwenta/sdk/utils'
import { useState, useMemo, useCallback } from 'react'
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
import { cancelDelayedOrder, executeDelayedOrder } from 'state/futures/actions'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { selectMarkets, selectIsExecutingOrder } from 'state/futures/selectors'
import { selectOpenDelayedOrders } from 'state/futures/smartMargin/selectors'
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
	const openDelayedOrders = useAppSelector(selectOpenDelayedOrders)
	const futuresMarkets = useAppSelector(selectMarkets)
	const isExecuting = useAppSelector(selectIsExecutingOrder)

	const [countdownTimers, setCountdownTimers] = useState<CountdownTimers>()

	const handleCancel = useCallback(
		(marketAddress: string, isOffchain: boolean) => () => {
			dispatch(cancelDelayedOrder({ marketAddress, isOffchain }))
		},
		[dispatch]
	)

	const handleExecute = useCallback(
		(marketKey: FuturesMarketKey, marketAddress: string, isOffchain: boolean) => () => {
			dispatch(executeDelayedOrder({ marketKey, marketAddress, isOffchain }))
		},
		[dispatch]
	)

	const rowsData = useMemo(() => {
		const ordersWithCancel = openDelayedOrders
			.map((o) => {
				const market = futuresMarkets.find((m) => m.market === o.marketAddress)
				const timer = countdownTimers ? countdownTimers[o.marketKey] : null
				const order = {
					...o,
					sizeTxt: formatCurrency(o.asset, o.size.abs(), {
						currencyKey: getDisplayAsset(o.asset) ?? '',
						minDecimals: suggestedDecimals(o.size),
					}),
					timeToExecution: timer?.timeToExecution,
					timePastExecution: timer?.timePastExecution,
					show: !!timer,
					isStale:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_CANCEL_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMaxAge
									: market.settings.maxDelayTimeDelta),
					isFailed:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution >
							DEFAULT_DELAYED_EXECUTION_BUFFER +
								(o.isOffchain
									? market.settings.offchainDelayedOrderMinAge
									: market.settings.minDelayTimeDelta),
					isExecutable:
						timer &&
						market?.settings &&
						timer.timeToExecution === 0 &&
						timer.timePastExecution <=
							(o.isOffchain
								? market.settings.offchainDelayedOrderMaxAge
								: market.settings.maxDelayTimeDelta),
					totalDeposit: o.commitDeposit.add(o.keeperDeposit),
				}
				return order
			})
			.sort((a, b) => {
				return b.asset === marketAsset && a.asset !== marketAsset
					? 1
					: b.asset === marketAsset && a.asset === marketAsset
					? 0
					: -1
			})
		return ordersWithCancel
	}, [openDelayedOrders, futuresMarkets, marketAsset, countdownTimers])

	useInterval(
		() => {
			const newCountdownTimers = rowsData.reduce((acc, order) => {
				const timeToExecution = Math.floor((order.executableAtTimestamp - Date.now()) / 1000)
				const timePastExecution = Math.floor((Date.now() - order.executableAtTimestamp) / 1000)

				// Only updated delayed orders
				acc[order.marketKey] = {
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
									<Body>{order.market}</Body>
									<Body capitalized color="secondary">
										{order.orderType}
									</Body>
								</div>
							</FlexDiv>
							<FlexDiv>
								{order.show && order.isStale && (
									<Pill
										size="medium"
										onClick={handleCancel(order.marketAddress, order.isOffchain)}
										disabled={order.isCancelling}
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
											onClick={handleExecute(
												order.marketKey,
												order.marketAddress,
												order.isOffchain
											)}
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

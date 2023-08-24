import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatNumber, getDisplayAsset, formatPercent } from '@kwenta/sdk/utils'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDivCol, FlexDivRow } from 'components/layout/flex'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { Body, NumericValue } from 'components/Text'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import PositionType from 'sections/futures/PositionType'
import TimeDisplay from 'sections/futures/Trades/TimeDisplay'
import { TradeStatus } from 'sections/futures/types'
import { selectFuturesType, selectMarketAsset } from 'state/futures/common/selectors'
import { selectAllTradesForAccountType, selectQueryStatuses } from 'state/futures/selectors'
import { fetchAllV2TradesForAccount } from 'state/futures/smartMargin/actions'
import { useAppSelector, useFetchAction } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { selectWallet } from 'state/wallet/selectors'

import TradeDrawer from '../drawers/TradeDrawer'

const TradesTab = () => {
	const { t } = useTranslation()
	const { switchToL2 } = useNetworkSwitcher()

	const walletAddress = useAppSelector(selectWallet)
	const marketAsset = useAppSelector(selectMarketAsset)
	const accountType = useAppSelector(selectFuturesType)
	const history = useAppSelector(selectAllTradesForAccountType)
	const { trades: tradesQuery } = useAppSelector(selectQueryStatuses)

	const isL2 = useIsL2()
	const isLoaded = !isL2 || tradesQuery.status === FetchStatus.Success

	const [selectedTrade, setSelectedTrade] = React.useState<any>()

	useFetchAction(fetchAllV2TradesForAccount, {
		dependencies: [walletAddress, accountType, marketAsset],
		disabled: !walletAddress,
	})

	const historyData = useMemo(() => {
		return history.map((trade) => {
			const notionalValue = trade?.price.mul(trade?.size.abs())
			const netPnl = trade.pnl.sub(trade.feesPaid)

			return {
				...trade,
				netPnl,
				pnlPct: notionalValue.gt(0) ? netPnl.div(notionalValue) : ZERO_WEI,
				notionalValue,
				value: Number(trade?.price),
				amount: Number(trade?.size.abs()),
				time: trade?.timestamp * 1000,
				id: trade?.txnHash,
				asset: marketAsset,
				displayAsset: getDisplayAsset(trade?.asset),
				type: trade.orderType,
				status: trade.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			}
		})
	}, [history, marketAsset])

	return (
		<div>
			{!isL2 ? (
				<TableNoResults style={{ marginTop: '15px' }}>
					{t('common.l2-cta')}
					<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
				</TableNoResults>
			) : isLoaded && historyData?.length === 0 ? (
				<TableNoResults style={{ marginTop: '15px' }}>
					{t('futures.market.user.trades.table.no-results')}
				</TableNoResults>
			) : (
				<StyledTable
					rounded={false}
					onTableRowClick={(row) => {
						setSelectedTrade(row.original)
					}}
					columns={[
						{
							header: () => <></>,
							accessorKey: 'market',
							cell: (cellProps) => (
								<Container>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.market')}</TableHeader>
										{cellProps.row.original.market ? (
											<FlexDivRow style={{ alignItems: 'flex-start' }}>
												<CurrencyIcon
													currencyKey={cellProps.row.original.market.marketKey}
													width={20}
													height={20}
													style={{ marginTop: '-2px' }}
												/>
												<Body>{cellProps.row.original.displayAsset}</Body>
											</FlexDivRow>
										) : (
											'-'
										)}
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.price')}</TableHeader>
										<Currency.Price price={cellProps.row.original.value} />
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.side')}</TableHeader>
										<div style={{ height: '100%' }}>
											<PositionType side={cellProps.row.original.side} />
										</div>
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.fees')}</TableHeader>
										<Currency.Price price={cellProps.row.original.feesPaid} />
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>
										<TimeDisplay
											value={cellProps.row.original.time}
											horizontal={true}
											shortDate={true}
										/>
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.order-type')}</TableHeader>
										<>{cellProps.row.original.orderType}</>
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.size')}</TableHeader>
										<FlexDivCol style={{ width: '80%', textAlign: 'right' }}>
											{`${formatNumber(cellProps.row.original.amount, { suggestDecimals: true })} ${
												cellProps.row.original.displayAsset
											}`}
											<Currency.Price
												price={cellProps.row.original.notionalValue}
												formatOptions={{ truncateOver: 1e6 }}
												colorType="secondary"
											/>
										</FlexDivCol>
									</FlexDivRow>
									<FlexDivRow>
										<TableHeader>{t('futures.market.user.trades.table.pnl')}</TableHeader>
										<FlexDivCol alignItems="flex-end">
											<Currency.Price price={cellProps.row.original.netPnl} colored />
											<NumericValue value={cellProps.row.original.pnlPct} colored>
												{formatPercent(cellProps.row.original.pnlPct, { minDecimals: 2 })}
											</NumericValue>
										</FlexDivCol>
									</FlexDivRow>
								</Container>
							),
						},
					]}
					data={historyData}
					isLoading={tradesQuery.status === FetchStatus.Loading}
				/>
			)}
			<TradeDrawer trade={selectedTrade} closeDrawer={() => setSelectedTrade(undefined)} />
		</div>
	)
}

export default TradesTab

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: repeat(4, 1fr);
	grid-column-gap: 15px;
	width: 100%;
	padding: 10px 5px;
`

const StyledTable = styled(Table)`
	border-width: 0px;
	.table-row:first-child {
		display: none;
	}

	${TableCell} {
		height: 100%;
	}
` as typeof Table

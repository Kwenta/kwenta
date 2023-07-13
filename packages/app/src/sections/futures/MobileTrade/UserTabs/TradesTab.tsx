import { PositionSide } from '@kwenta/sdk/types'
import { formatCryptoCurrency } from '@kwenta/sdk/utils'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { GridDivCenteredRow } from 'components/layout/grid'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { ETH_UNIT } from 'constants/network'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import TimeDisplay from 'sections/futures/Trades/TimeDisplay'
import { TradeStatus } from 'sections/futures/types'
import {
	selectAllTradesForAccountType,
	selectFuturesType,
	selectMarketAsset,
	selectQueryStatuses,
} from 'state/futures/selectors'
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
			const pnl = trade.pnl.div(ETH_UNIT)
			const feesPaid = trade.feesPaid.div(ETH_UNIT)
			const netPnl = pnl.sub(feesPaid)
			return {
				...trade,
				pnl,
				feesPaid,
				netPnl,
				value: Number(trade.price.div(ETH_UNIT)),
				amount: Number(trade.size.div(ETH_UNIT).abs()),
				time: trade.timestamp * 1000,
				id: trade.txnHash,
				asset: marketAsset,
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
				<Table
					rounded={false}
					onTableRowClick={(row) => {
						setSelectedTrade(row.original)
					}}
					columns={[
						{
							header: () => <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
							accessorKey: 'time',
							cell: (cellProps) => (
								<GridDivCenteredRow>
									<TimeDisplay value={cellProps.getValue()} />
								</GridDivCenteredRow>
							),
							size: 80,
							enableSorting: true,
						},
						{
							header: () => (
								<TableHeader>{t('futures.market.user.trades.table.side-type')}</TableHeader>
							),
							accessorKey: 'side',
							sortingFn: 'basic',
							cell: (cellProps) => (
								<div>
									<StyledPositionSide side={cellProps.getValue()}>
										{cellProps.getValue()}
									</StyledPositionSide>
									<div>{cellProps.row.original.orderType}</div>
								</div>
							),
							size: 100,
							enableSorting: true,
						},
						{
							header: () => (
								<TableHeader>{t('futures.market.user.trades.table.trade-size')}</TableHeader>
							),
							accessorKey: 'amount',
							sortingFn: 'basic',
							cell: (cellProps) => (
								<>{formatCryptoCurrency(cellProps.getValue(), { suggestDecimals: true })}</>
							),
							size: 80,
							enableSorting: true,
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

const StyledPositionSide = styled.div<{ side: PositionSide }>`
	text-transform: uppercase;
	font-weight: bold;
	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.selectedTheme.green};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}
`

import { formatDollars, formatNumber, getDisplayAsset } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import { FlexDivCol } from 'components/layout/flex'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import ROUTES from 'constants/routes'
import { blockExplorer } from 'containers/Connector/Connector'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import useWindowSize from 'hooks/useWindowSize'
import {
	selectAllTradesForAccountType,
	selectFuturesType,
	selectMarketAsset,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'

import { TradeStatus } from '../types'
import TableMarketDetails from '../UserInfo/TableMarketDetails'

import TimeDisplay from './TimeDisplay'

type TradesProps = {
	rounded?: boolean
	noBottom?: boolean
}
const Trades: FC<TradesProps> = memo(({ rounded = false, noBottom = true }) => {
	const { t } = useTranslation()
	const { switchToL2 } = useNetworkSwitcher()
	const router = useRouter()
	const { lessThanWidth } = useWindowSize()
	const marketAsset = useAppSelector(selectMarketAsset)
	const accountType = useAppSelector(selectFuturesType)
	const history = useAppSelector(selectAllTradesForAccountType)
	const { trades } = useAppSelector(selectQueryStatuses)

	const isLoading = !history.length && trades.status === FetchStatus.Loading
	const isLoaded = trades.status === FetchStatus.Success

	const isL2 = useIsL2()

	const historyData = useMemo(() => {
		return history.map((trade) => {
			const pnl = trade?.pnl
			const feesPaid = trade?.feesPaid
			const netPnl = pnl.sub(feesPaid)

			return {
				...trade,
				pnl,
				feesPaid,
				netPnl,
				notionalValue: trade?.price.mul(trade?.size.abs()),
				value: Number(trade?.price),
				funding: Number(trade?.fundingAccrued),
				amount: trade?.size.abs(),
				time: trade?.timestamp * 1000,
				id: trade?.txnHash,
				asset: marketAsset,
				displayAsset: getDisplayAsset(trade?.asset),
				type: trade?.orderType,
				status: trade?.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
			}
		})
	}, [history, marketAsset])

	const columnsDeps = useMemo(() => [historyData], [historyData])

	return lessThanWidth('xl') ? (
		<Table
			highlightRowsOnHover
			rounded={rounded}
			noBottom={noBottom}
			columns={[
				{
					header: () => (
						<TableHeader>{t('futures.market.user.trades.table.market-side')}</TableHeader>
					),
					accessorKey: 'market',
					cell: (cellProps) => {
						return (
							<MarketDetailsContainer
								onClick={(e) => {
									cellProps.row.original.market &&
										router.push(
											ROUTES.Markets.MarketPair(cellProps.row.original.market.asset, accountType)
										)
									e.stopPropagation()
								}}
							>
								{cellProps.row.original.market ? (
									<TableMarketDetails
										marketName={cellProps.row.original.displayAsset!}
										marketKey={cellProps.row.original.market?.marketKey}
										side={cellProps.row.original.side}
									/>
								) : (
									'-'
								)}
							</MarketDetailsContainer>
						)
					},
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
					accessorKey: 'time',
					cell: (cellProps) => <TimeDisplay value={cellProps.getValue()} />,
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader style={{ width: '90%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.price-type')}
						</TableHeader>
					),
					accessorKey: 'value',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return (
							<FlexDivCol style={{ width: '90%', textAlign: 'right' }}>
								<Currency.Price price={cellProps.getValue()} />
								<Body color="secondary">{cellProps.row.original.type}</Body>
							</FlexDivCol>
						)
					},
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader style={{ width: '90%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.size')}
						</TableHeader>
					),
					accessorKey: 'amount',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return (
							<FlexDivCol style={{ width: '90%', textAlign: 'right' }}>
								{formatNumber(cellProps.getValue(), { suggestDecimals: true })}
								<Currency.Price
									price={cellProps.row.original.notionalValue}
									formatOptions={{ truncateOver: 1e6 }}
									colorType="secondary"
								/>
							</FlexDivCol>
						)
					},
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader style={{ width: '80%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.pnl')}
						</TableHeader>
					),
					accessorKey: 'netPnl',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return cellProps.getValue().eq(0) ? (
							'--'
						) : (
							<ColoredPrice
								priceChange={cellProps.getValue().gt(0) ? 'up' : 'down'}
								style={{ width: '80%', textAlign: 'right' }}
							>
								{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}
							</ColoredPrice>
						)
					},
					enableSorting: true,
				},
				{
					header: () => (
						<TableHeader style={{ width: '80%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.fees')}
						</TableHeader>
					),
					sortingFn: 'basic',
					accessorKey: 'feesPaid',
					cell: (cellProps) => (
						<div style={{ width: '80%', textAlign: 'right' }}>
							<Currency.Price price={cellProps.getValue()} />
						</div>
					),
					enableSorting: true,
				},
			]}
			columnsDeps={columnsDeps}
			data={historyData}
			isLoading={isLoading && isLoaded}
			onTableRowClick={(row) =>
				window.open(blockExplorer.txLink(row.original.txnHash), '_blank', 'noopener noreferrer')
			}
			noResultsMessage={
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : isLoaded && historyData?.length === 0 ? (
					<TableNoResults>{t('futures.market.user.trades.table.no-results')}</TableNoResults>
				) : undefined
			}
		/>
	) : (
		<Table
			highlightRowsOnHover
			rounded={rounded}
			noBottom={noBottom}
			columns={[
				{
					header: () => (
						<TableHeader>{t('futures.market.user.trades.table.market-side')}</TableHeader>
					),
					accessorKey: 'market',
					cell: (cellProps) => {
						return (
							<MarketDetailsContainer
								onClick={(e) => {
									cellProps.row.original.market &&
										router.push(
											ROUTES.Markets.MarketPair(cellProps.row.original.market.asset, accountType)
										)
									e.stopPropagation()
								}}
							>
								{cellProps.row.original.market ? (
									<TableMarketDetails
										marketName={cellProps.row.original.market?.marketName}
										marketKey={cellProps.row.original.market?.marketKey}
										side={cellProps.row.original.side}
									/>
								) : (
									'-'
								)}
							</MarketDetailsContainer>
						)
					},
					size: 90,
				},
				{
					header: () => <TableHeader>{t('futures.market.user.trades.table.date')}</TableHeader>,
					accessorKey: 'time',
					cell: (cellProps) => <TimeDisplay value={cellProps.getValue()} />,
					enableSorting: true,
					size: 90,
				},
				{
					header: () => (
						<TableHeader style={{ width: '60%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.price')}
						</TableHeader>
					),
					accessorKey: 'value',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return (
							<div style={{ width: '60%', textAlign: 'right' }}>
								<ColoredPrice>
									{formatDollars(cellProps.getValue(), { suggestDecimals: true })}
								</ColoredPrice>
							</div>
						)
					},
					enableSorting: true,
					size: 125,
				},
				{
					header: () => (
						<TableHeader style={{ width: '80%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.size')}
						</TableHeader>
					),
					accessorKey: 'amount',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return (
							<FlexDivCol style={{ width: '80%', textAlign: 'right' }}>
								{formatNumber(cellProps.getValue(), { suggestDecimals: true })}
								<Currency.Price
									price={cellProps.row.original.notionalValue}
									formatOptions={{ truncateOver: 1e6 }}
									colorType="secondary"
								/>
							</FlexDivCol>
						)
					},
					enableSorting: true,
					size: 100,
				},
				{
					header: () => (
						<TableHeader style={{ width: '70%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.pnl')}
						</TableHeader>
					),
					accessorKey: 'netPnl',
					sortingFn: 'basic',
					cell: (cellProps) => {
						return cellProps.getValue().eq(0) ? (
							'--'
						) : (
							<ColoredPrice
								priceChange={cellProps.getValue().gt(0) ? 'up' : 'down'}
								style={{ width: '70%', textAlign: 'right' }}
							>
								{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}
							</ColoredPrice>
						)
					},
					enableSorting: true,
					size: 100,
				},
				{
					header: () => (
						<TableHeader style={{ width: '60%', textAlign: 'right' }}>
							{t('futures.market.user.trades.table.fees')}
						</TableHeader>
					),
					sortingFn: 'basic',
					accessorKey: 'feesPaid',
					cell: (cellProps) => {
						return cellProps.getValue().eq(0) ? (
							'--'
						) : (
							<FlexDivCol style={{ width: '60%', textAlign: 'right' }}>
								<Currency.Price price={cellProps.getValue()} />
							</FlexDivCol>
						)
					},
					enableSorting: true,
					size: 100,
				},
				{
					header: () => (
						<TableHeader>{t('futures.market.user.trades.table.order-type')}</TableHeader>
					),
					accessorKey: 'type',
					sortingFn: 'basic',
					cell: (cellProps) => <>{cellProps.getValue()}</>,
					size: 60,
				},
			]}
			columnsDeps={columnsDeps}
			data={historyData}
			isLoading={isLoading && isLoaded}
			onTableRowClick={(row) =>
				window.open(blockExplorer.txLink(row.original.txnHash), '_blank', 'noopener noreferrer')
			}
			noResultsMessage={
				!isL2 ? (
					<TableNoResults>
						{t('common.l2-cta')}
						<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
					</TableNoResults>
				) : isLoaded && historyData?.length === 0 ? (
					<TableNoResults>{t('futures.market.user.trades.table.no-results')}</TableNoResults>
				) : undefined
			}
		/>
	)
})

export default Trades

const MarketDetailsContainer = styled.div`
	cursor: pointer;
`

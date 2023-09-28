import { formatDollars, formatNumber } from '@kwenta/sdk/utils'
import { wei, WeiSource } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDiv, FlexDivCol } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { Body } from 'components/Text'
import ROUTES from 'constants/routes'
import { blockExplorer } from 'containers/Connector/Connector'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import { selectFuturesType } from 'state/futures/common/selectors'
import {
	selectAllTradesForAccountType,
	selectTradesHistoryTableData,
} from 'state/futures/selectors'
import { selectSmartMarginQueryStatuses } from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'

import PositionType from '../PositionType'
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
	const accountType = useAppSelector(selectFuturesType)
	const history = useAppSelector(selectAllTradesForAccountType)
	const historyData = useAppSelector(selectTradesHistoryTableData)
	const { trades } = useAppSelector(selectSmartMarginQueryStatuses)

	const isLoading = !history.length && trades.status === FetchStatus.Loading
	const isLoaded = trades.status === FetchStatus.Success

	const isL2 = useIsL2()

	const columnsDeps = useMemo(() => [historyData], [historyData])

	return (
		<>
			<DesktopOnlyView>
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
													ROUTES.Markets.MarketPair(
														cellProps.row.original.market.asset,
														accountType
													)
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
			</DesktopOnlyView>

			<MobileOrTabletView>
				<MobileTable
					highlightRowsOnHover
					rounded={rounded}
					noBottom={noBottom}
					columns={[
						{
							accessorKey: 'market',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.market')}</TableHeader>
									<CurrencyInfo>
										<MobileCurrencyIcon currencyKey={cellProps.row.original.market!.marketKey} />
										<StyledSubtitle>{cellProps.row.original.market!.marketName}</StyledSubtitle>
									</CurrencyInfo>
								</>
							),
						},
						{
							accessorKey: 'price',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.price')}</TableHeader>
									<Currency.Price price={cellProps.row.original.price} />
								</>
							),
						},
						{
							accessorKey: 'side',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.side')}</TableHeader>
									<PositionType side={cellProps.row.original.side} variant={'text'} />
								</>
							),
						},
						{
							accessorKey: 'fees',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.fees')}</TableHeader>
									<Currency.Price price={cellProps.row.original.feesPaid} />
								</>
							),
						},
						{
							accessorKey: 'date',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.date')}</TableHeader>
									<TimeDisplay horizontal shortDate value={cellProps.row.original.timestamp} />
								</>
							),
						},
						{
							accessorKey: 'type',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.type')}</TableHeader>
									<div>{cellProps.row.original.orderType}</div>
								</>
							),
						},
						{
							accessorKey: 'size',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.size')}</TableHeader>
									<FlexDivCol style={{ textAlign: 'right' }}>
										<div>
											{formatNumber(cellProps.row.original.amount, { suggestDecimals: true })}
											{' ETH'}
										</div>
										<Currency.Price
											price={cellProps.row.original.notionalValue}
											formatOptions={{ truncateOver: 1e6 }}
											colorType="secondary"
										/>
									</FlexDivCol>
								</>
							),
						},
						{
							accessorKey: 'pnl',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('futures.market.user.trades.mobile-table.pnl')}</TableHeader>
									<FlexDivCol style={{ textAlign: 'right' }}>
										<Currency.Price price={cellProps.row.original.pnl} colored />
										<StyledValue $value={cellProps.row.original.pnlPct}>
											{formatNumber(cellProps.row.original.pnlPct)}%
										</StyledValue>
									</FlexDivCol>
								</>
							),
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
			</MobileOrTabletView>
		</>
	)
})

export default Trades

const MarketDetailsContainer = styled.div`
	cursor: pointer;
`
const MobileTable = styled(Table)`
	.table-row:first-child {
		display: none;
	}

	.table-body-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 15px;
		grid-row-gap: 15px;
		padding: 15px;
	}

	${TableCell}:first-child,
	${TableCell}:last-child {
		padding: 0;
	}
	${TableCell} {
		height: 100%;
		width: 100% !important;
		display: flex;
		align-items: start;
		justify-content: space-between;
	}
` as typeof Table

const CurrencyInfo = styled(FlexDiv)`
	align-items: center;
`

const MobileCurrencyIcon = styled(CurrencyIcon)`
	& > img {
		width: 20px;
		height: 20px;
	}
`

const StyledSubtitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-transform: capitalize;
`

const valueColor = css<{ $value: WeiSource }>`
	color: ${(props) =>
		wei(props.$value).gt(0)
			? props.theme.colors.selectedTheme.green
			: wei(props.$value).lt(0)
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text.primary};
`

const StyledValue = styled.div<{ $value: WeiSource }>`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	margin: 0;
	${valueColor}
`

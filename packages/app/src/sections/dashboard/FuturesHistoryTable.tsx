import { FuturesMarketAsset, FuturesTrade } from '@kwenta/sdk/types'
import {
	MarketKeyByAsset,
	getDisplayAsset,
	formatCryptoCurrency,
	formatDollars,
	formatShortDateWithoutYear,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import * as _ from 'lodash/fp'
import Link from 'next/link'
import { FC, useMemo, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import FuturesIcon from 'components/Nav/FuturesIcon'
import Table, { TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import { ETH_UNIT } from 'constants/network'
import { NO_VALUE } from 'constants/placeholder'
import ROUTES from 'constants/routes'
import useIsL2 from 'hooks/useIsL2'
import useNetworkSwitcher from 'hooks/useNetworkSwitcher'
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency'
import TradeDrawer from 'sections/futures/MobileTrade/drawers/TradeDrawer'
import PositionType from 'sections/futures/PositionType'
import { TradeStatus } from 'sections/futures/types'
import {
	selectAllUsersTrades,
	selectFuturesType,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { getMarketName } from 'utils/futures'

import TimeDisplay from '../futures/Trades/TimeDisplay'

const conditionalRender = <T,>(prop: T, children: ReactElement) =>
	_.isNil(prop) ? <Body>{NO_VALUE}</Body> : children

const FuturesHistoryTable: FC = () => {
	const [selectedTrade, setSelectedTrade] = useState<FuturesTrade>()
	const { t } = useTranslation()
	const isL2 = useIsL2()
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency()
	const { switchToL2 } = useNetworkSwitcher()

	const accountType = useAppSelector(selectFuturesType)
	const trades = useAppSelector(selectAllUsersTrades)
	const { trades: tradesQueryStatus } = useAppSelector(selectQueryStatuses)

	const mappedHistoricalTrades = useMemo(
		() =>
			isL2
				? trades
						.map((trade) => {
							const pnl = trade.pnl.div(ETH_UNIT)
							const feesPaid = trade.feesPaid.div(ETH_UNIT)
							const netPnl = pnl.sub(feesPaid)
							return {
								...trade,
								pnl,
								feesPaid,
								netPnl,
								displayAsset: getDisplayAsset(trade.asset),
								market: getMarketName(trade.asset),
								price: trade.price.div(ETH_UNIT),
								size: trade.size.div(ETH_UNIT).abs(),
								timestamp: trade.timestamp * 1000,
								date: formatShortDateWithoutYear(new Date(trade.timestamp * 1000)),
								id: trade.txnHash,
								status: trade.positionClosed ? TradeStatus.CLOSED : TradeStatus.OPEN,
							}
						})
						.sort((a, b) => b.timestamp - a.timestamp)
				: [],
		[isL2, trades]
	)

	return (
		<>
			<DesktopOnlyView>
				<TableContainer>
					<StyledTable
						data={mappedHistoricalTrades}
						showPagination
						pageSize={16}
						isLoading={tradesQueryStatus.status === FetchStatus.Loading}
						noResultsMessage={
							!isL2 ? (
								<TableNoResults>
									{t('common.l2-cta')}
									<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
								</TableNoResults>
							) : (
								<TableNoResults>
									{t('dashboard.history.futures-history-table.no-result')}
									<Link href={ROUTES.Markets.Home(accountType)}>
										<div>{t('common.perp-cta')}</div>
									</Link>
								</TableNoResults>
							)
						}
						highlightRowsOnHover
						columns={[
							{
								header: () => <div>{t('dashboard.history.futures-history-table.date-time')}</div>,
								accessorKey: 'dateTime',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.timestamp,
										<StyledTimeDisplay>
											<TimeDisplay value={cellProps.row.original.timestamp} />
										</StyledTimeDisplay>
									)
								},
								size: 100,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.market')}</div>,
								accessorKey: 'market',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.asset,
										<>
											{cellProps.row.original.asset && (
												<SynthContainer>
													<StyledCurrencyIcon
														currencyKey={
															MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
														}
													/>
													<StyledText>{cellProps.getValue()}</StyledText>
													<FuturesIcon type={cellProps.row.original.accountType} />
												</SynthContainer>
											)}
										</>
									)
								},
								size: 120,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.side')}</div>,
								accessorKey: 'side',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.side,
										<PositionType side={cellProps.getValue()} />
									)
								},
								size: 70,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.size')}</div>,
								accessorKey: 'size',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.size,
										<>{formatCryptoCurrency(cellProps.getValue(), { suggestDecimals: true })}</>
									)
								},
								size: 100,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.price')}</div>,
								accessorKey: 'price',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.price,
										<>{formatDollars(cellProps.getValue(), { suggestDecimals: true })}</>
									)
								},
								size: 120,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.pnl')}</div>,
								accessorKey: 'netPnl',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.getValue(),
										cellProps.getValue().eq(wei(0)) ? (
											<PNL normal>--</PNL>
										) : (
											<PNL negative={cellProps.getValue().lt(wei(0))}>
												{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}
											</PNL>
										)
									)
								},
								size: 120,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.fees')}</div>,
								accessorKey: 'fees',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.feesPaid,
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.feesPaid}
											sign={selectedPriceCurrency.sign}
											conversionRate={selectPriceCurrencyRate}
										/>
									)
								},
								size: 120,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.type')}</div>,
								accessorKey: 'orderType',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.orderType,
										<StyledText>{cellProps.row.original.orderType}</StyledText>
									)
								},
								size: 80,
							},
						]}
					/>
				</TableContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<TableContainer>
					<MobileStyledTable
						data={mappedHistoricalTrades}
						onTableRowClick={(row) => {
							setSelectedTrade(row.original)
						}}
						isLoading={tradesQueryStatus.status === FetchStatus.Loading}
						noResultsMessage={
							!isL2 ? (
								<TableNoResults>
									{t('common.l2-cta')}
									<div onClick={switchToL2}>{t('homepage.l2.cta-buttons.switch-l2')}</div>
								</TableNoResults>
							) : (
								<TableNoResults>
									{t('dashboard.history.futures-history-table.no-result')}
									<Link href={ROUTES.Markets.Home(accountType)}>
										<div>{t('common.perp-cta')}</div>
									</Link>
								</TableNoResults>
							)
						}
						columns={[
							{
								header: () => <div>{t('dashboard.history.futures-history-table.asset')}</div>,
								accessorKey: 'displayAsset',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.asset,
										<>
											{cellProps.row.original.asset && (
												<MobileSynthContainer>
													<MobileStyledCurrencyIcon
														currencyKey={
															MarketKeyByAsset[cellProps.row.original.asset as FuturesMarketAsset]
														}
													/>
													<MobileMarketContainer>
														<StyledText>{cellProps.getValue()}</StyledText>
														<FuturesIcon type={cellProps.row.original.accountType} />
													</MobileMarketContainer>
													<StyledText>{cellProps.row.original.date}</StyledText>
												</MobileSynthContainer>
											)}
										</>
									)
								},
								size: 60,
							},
							{
								header: () => (
									<div>
										<div>{t('dashboard.history.futures-history-table.side')}</div>
										<div>{t('dashboard.history.futures-history-table.type')}</div>
									</div>
								),
								accessorKey: 'side',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.side,
										<div>
											<PositionType side={cellProps.getValue()} mobile />
											<div>{cellProps.row.original.orderType}</div>
										</div>
									)
								},
								size: 60,
							},
							{
								header: () => (
									<div>
										<div>{t('dashboard.history.futures-history-table.size')}</div>
										<div>{t('dashboard.history.futures-history-table.price')}</div>
									</div>
								),
								accessorKey: 'size',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.row.original.price,
										<div>
											<div>
												{formatCryptoCurrency(cellProps.getValue(), { suggestDecimals: true })}
											</div>
											<div>{formatDollars(cellProps.row.original.price ?? 0)}</div>
										</div>
									)
								},
								size: 60,
							},
							{
								header: () => <div>{t('dashboard.history.futures-history-table.pnl')}</div>,
								accessorKey: 'netPnl',
								cell: (cellProps) => {
									return conditionalRender(
										cellProps.getValue(),
										cellProps.getValue().eq(wei(0)) ? (
											<PNL normal>--</PNL>
										) : (
											<PNL negative={cellProps.getValue().lt(wei(0))}>
												{formatDollars(cellProps.getValue(), { maxDecimals: 2 })}
											</PNL>
										)
									)
								},
								size: 60,
							},
						]}
					/>
				</TableContainer>
				<TradeDrawer trade={selectedTrade} closeDrawer={() => setSelectedTrade(undefined)} />
			</MobileOrTabletView>
		</>
	)
}

const StyledTimeDisplay = styled.div`
	div {
		margin-left: 2px;
	}
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
`

const MobileStyledCurrencyIcon = styled(Currency.Icon)`
	grid-row: 1 / span 2;
	width: 20px;
	height: 20px;
`

const TableContainer = styled.div`
	margin-top: 16px;
	margin-bottom: 40px;
	.paused {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`

const StyledTable = styled(Table)`
	margin-bottom: 20px;
` as typeof Table

const MobileStyledTable = styled(Table)`
	margin-bottom: 20px;
	border-radius: initial;
	border-top: none;
	border-left: none;
	border-right: none;
` as typeof Table

const StyledText = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

const SynthContainer = styled.div`
	display: flex;
	align-items: center;
	column-gap: 5px;
	margin-left: -4px;
`

const MobileSynthContainer = styled.div`
	display: grid;
	align-items: center;
	grid-template-columns: repeat(2, auto);
	grid-template-rows: repeat(2, auto);
	column-gap: 5px;
	margin-left: -4px;
`

const MobileMarketContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 5px;
`

const PNL = styled.div<{ negative?: boolean; normal?: boolean }>`
	color: ${(props) =>
		props.normal
			? props.theme.colors.selectedTheme.button.text
			: props.negative
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.green};
`

export default FuturesHistoryTable

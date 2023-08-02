import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesPositionHistory } from '@kwenta/sdk/dist/types'
import { getMarketName, MarketKeyByAsset } from '@kwenta/sdk/utils'
import { wei, WeiSource } from '@synthetixio/wei'
import router from 'next/router'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Currency from 'components/Currency'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDiv } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { Body } from 'components/Text'
import ROUTES from 'constants/routes'
import TimeDisplay from 'sections/futures/Trades/TimeDisplay'
import { selectFuturesPositions, selectQueryStatuses } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { ExternalLink } from 'styles/common'
import media from 'styles/media'

type TraderHistoryProps = {
	trader: string
	traderEns?: string | null
	positionHistory: FuturesPositionHistory[]
	resetSelection: () => void
	compact?: boolean
	searchTerm?: string | undefined
}

const TraderHistory: FC<TraderHistoryProps> = memo(
	({ trader, traderEns, positionHistory, resetSelection, compact, searchTerm }) => {
		const { t } = useTranslation()
		const positions = useAppSelector(selectFuturesPositions)
		const { selectedTraderPositionHistory: queryStatus } = useAppSelector(selectQueryStatuses)

		let data = useMemo(() => {
			return positionHistory
				.sort((a, b) => b.timestamp - a.timestamp)
				.map((stat, i) => {
					const totalDeposit = stat.initialMargin.add(stat.totalDeposits)
					const thisPosition = stat.isOpen
						? positions.find((p) => p.marketKey === stat.marketKey)
						: null

					const funding = stat.netFunding.add(thisPosition?.position?.accruedFunding ?? ZERO_WEI)
					const pnlWithFeesPaid = stat.pnl.sub(stat.feesPaid).add(funding)

					return {
						...stat,
						rank: i + 1,
						currencyIconKey: MarketKeyByAsset[stat.asset],
						marketShortName: getMarketName(stat.asset),
						status: stat.isOpen ? 'Open' : stat.isLiquidated ? 'Liquidated' : 'Closed',
						funding,
						pnl: pnlWithFeesPaid,
						pnlPct: totalDeposit.gt(0)
							? `(${pnlWithFeesPaid
									.div(stat.initialMargin.add(stat.totalDeposits))
									.mul(100)
									.toNumber()
									.toFixed(2)}%)`
							: '0%',
					}
				})
				.filter((i) =>
					searchTerm?.length
						? i.marketShortName.toLowerCase().includes(searchTerm) ||
						  i.status.toLowerCase().includes(searchTerm)
						: true
				)
		}, [positionHistory, positions, searchTerm])

		return (
			<>
				<DesktopOnlyView>
					<StyledTable
						// @ts-ignore
						compact={compact}
						showPagination
						pageSize={10}
						isLoading={queryStatus.status === FetchStatus.Loading}
						data={data}
						hideHeaders={compact}
						autoResetPageIndex={false}
						compactPagination={true}
						columns={[
							{
								header: () => (
									<TableTitle>
										<TitleText onClick={resetSelection}>
											{t('leaderboard.trader-history.table.back')}
										</TitleText>
										<TitleSeparator>&gt;</TitleSeparator>
										<ExternalLink
											href={`https://optimistic.etherscan.io/address/${trader}`}
											hoverUnderline
										>
											{traderEns ?? trader}
										</ExternalLink>
									</TableTitle>
								),
								accessorKey: 'title',
								enableSorting: false,
								columns: [
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.timestamp')}</TableHeader>
										),
										accessorKey: 'openTimestamp',
										cell: (cellProps) => {
											return (
												<StyledCell>
													<TimeDisplay value={cellProps.row.original.openTimestamp} />
												</StyledCell>
											)
										},
										size: 100,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>
										),
										accessorKey: 'asset',
										cell: (cellProps) => (
											<CurrencyInfo>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
												<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
											</CurrencyInfo>
										),
										size: 150,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>
										),
										accessorKey: 'status',
										cell: (cellProps) => {
											return <Body color="primary">{cellProps.row.original.status}</Body>
										},
										size: 30,
									},
									{
										header: () => (
											<RightAlignedTableHeader>
												{t('leaderboard.trader-history.table.total-trades')}
											</RightAlignedTableHeader>
										),
										accessorKey: 'trades',
										cell: (cellProps) => (
											<RightAlignedContainer>{cellProps.getValue()}</RightAlignedContainer>
										),
										size: 130,
									},
									{
										header: () => (
											<RightAlignedTableHeader>
												{t('leaderboard.trader-history.table.total-volume')}
											</RightAlignedTableHeader>
										),
										accessorKey: 'totalVolume',
										cell: (cellProps) => (
											<RightAlignedContainer>
												<Currency.Price price={cellProps.getValue()} />
											</RightAlignedContainer>
										),
										size: 130,
									},
									{
										header: () => (
											<RightAlignedTableHeader>
												{t('leaderboard.trader-history.table.total-pnl')}
											</RightAlignedTableHeader>
										),
										accessorKey: 'pnl',
										cell: (cellProps) => (
											<RightAlignedContainer>
												<Currency.Price price={cellProps.row.original.pnl} colored />
												<StyledValue $value={cellProps.row.original.pnl}>
													{cellProps.row.original.pnlPct}
												</StyledValue>
											</RightAlignedContainer>
										),
										size: 130,
									},
									{
										header: () => (
											<RightAlignedTableHeader>
												{t('leaderboard.trader-history.table.funding')}
											</RightAlignedTableHeader>
										),
										accessorKey: 'funding',
										cell: (cellProps) => (
											<RightAlignedContainer>
												<Currency.Price price={cellProps.getValue()} colored />
											</RightAlignedContainer>
										),
										size: 130,
									},
								],
							},
						]}
						noResultsMessage={
							queryStatus.status !== FetchStatus.Loading &&
							data?.length === 0 && (
								<TableNoResults>
									{t('dashboard.history.positions-history-table.no-result')}
								</TableNoResults>
							)
						}
					/>
				</DesktopOnlyView>
				<MobileOrTabletView>
					<StyledTable
						data={data}
						// @ts-ignore
						compact={compact}
						hideHeaders={compact}
						isLoading={false}
						showPagination
						pageSize={10}
						autoResetPageIndex={false}
						columns={[
							{
								header: () => (
									<TableTitle>
										<TitleText
											onClick={() => {
												resetSelection()
												router.push(ROUTES.Leaderboard.Home)
											}}
										>
											{t('leaderboard.leaderboard.table.title')}
										</TitleText>
										<TitleSeparator>&gt;</TitleSeparator>
										<ExternalLink
											href={`https://optimistic.etherscan.io/address/${trader}`}
											hoverUnderline
										>
											{traderEns ?? trader}
										</ExternalLink>
									</TableTitle>
								),
								accessorKey: 'title',
								enableSorting: false,
								columns: [
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.market')}</TableHeader>
										),
										accessorKey: 'asset',
										cell: (cellProps) => (
											<CurrencyInfo>
												<StyledCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
												<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
											</CurrencyInfo>
										),
										size: 50,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>
										),
										accessorKey: 'status',
										cell: (cellProps) => {
											return <Body color="primary">{cellProps.row.original.status}</Body>
										},
										size: 30,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
										),
										accessorKey: 'pnl',
										cell: (cellProps) => (
											<RightAlignedContainer>
												<Currency.Price price={cellProps.row.original.pnl} colored />
												<StyledValue $value={cellProps.row.original.pnl}>
													{cellProps.row.original.pnlPct}
												</StyledValue>
											</RightAlignedContainer>
										),
										size: 40,
									},
								],
							},
						]}
					/>
				</MobileOrTabletView>
			</>
		)
	}
)

const RightAlignedTableHeader = styled(TableHeader)`
	width: 90%;
	text-align: right;
`

const RightAlignedContainer = styled.div`
	width: 90%;
	text-align: right;
`

const StyledTable = styled(Table)<{ compact?: boolean; height?: number }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
	height: ${({ height }) => (height ? height + 'px' : 'auto')};
	max-height: 665px;
	${media.lessThan('lg')`
		max-height: 600px;
	`}

	${media.lessThan('md')`
		margin-bottom: 150px;
	`}
` as typeof Table

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-start;
`

const TitleText = styled.a`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};

	&:hover {
		text-decoration: underline;
	}
`

const StyledCell = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	padding-top: 5px;
	padding-bottom: 5px;
`

const TitleSeparator = styled.div`
	margin-left: 10px;
	margin-right: 10px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 5px;
`

const CurrencyInfo = styled(FlexDiv)`
	align-items: center;
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

export default TraderHistory

import { ZERO_WEI } from '@kwenta/sdk/constants'
import { wei, WeiSource } from '@synthetixio/wei'
import router from 'next/router'
import { FC, memo, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Currency from 'components/Currency'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDiv } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import FuturesIcon from 'components/Nav/FuturesIcon'
import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import { BANNER_HEIGHT_DESKTOP } from 'constants/announcement'
import ROUTES from 'constants/routes'
import TimeDisplay from 'sections/futures/Trades/TimeDisplay'
import { selectShowBanner } from 'state/app/selectors'
import { fetchPositionHistoryForTrader } from 'state/futures/actions'
import {
	selectFuturesPositions,
	selectPositionHistoryForSelectedTrader,
	selectQueryStatuses,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { ExternalLink, FOOTER_HEIGHT } from 'styles/common'
import media from 'styles/media'
import { getMarketName } from 'utils/futures'

type TraderHistoryProps = {
	trader: string
	traderEns?: string | null
	resetSelection: () => void
	compact?: boolean
	searchTerm?: string | undefined
}

const TraderHistory: FC<TraderHistoryProps> = memo(
	({ trader, traderEns, resetSelection, compact, searchTerm }) => {
		const { t } = useTranslation()
		const dispatch = useAppDispatch()
		const positionHistory = useAppSelector(selectPositionHistoryForSelectedTrader)
		const positions = useAppSelector(selectFuturesPositions)
		const showBanner = useAppSelector(selectShowBanner)
		const { selectedTraderPositionHistory: queryStatus } = useAppSelector(selectQueryStatuses)

		useEffect(() => {
			dispatch(fetchPositionHistoryForTrader(trader))
		}, [trader, dispatch])

		let data = useMemo(() => {
			return positionHistory
				.sort((a, b) => b.timestamp - a.timestamp)
				.map((stat, i) => {
					const totalDeposit = stat.initialMargin.add(stat.totalDeposits)
					const thisPosition = stat.isOpen
						? positions.find((p) => p.market.marketKey === stat.marketKey)
						: null

					const pnlWithFeesPaid = stat.pnl
						.sub(stat.feesPaid)
						.add(stat.netFunding)
						.add(thisPosition?.accruedFunding ?? ZERO_WEI)

					return {
						...stat,
						rank: i + 1,
						currencyIconKey: stat.asset ? (stat.asset[0] !== 's' ? 's' : '') + stat.asset : '',
						marketShortName: getMarketName(stat.asset),
						status: stat.isOpen ? 'Open' : stat.isLiquidated ? 'Liquidated' : 'Closed',
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

		const tableHeight = useMemo(
			() => window.innerHeight - FOOTER_HEIGHT - 161 - Number(showBanner) * BANNER_HEIGHT_DESKTOP,
			[showBanner]
		)

		return (
			<>
				<DesktopOnlyView>
					<StyledTable
						// @ts-ignore
						height={tableHeight}
						compact={compact}
						showPagination
						pageSize={10}
						isLoading={queryStatus.status === FetchStatus.Loading}
						data={data}
						hideHeaders={compact}
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
										size: compact ? 40 : 100,
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
												<StyledFuturesIcon type={cellProps.row.original.accountType} />
											</CurrencyInfo>
										),
										size: compact ? 40 : 100,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.status')}</TableHeader>
										),
										accessorKey: 'status',
										cell: (cellProps) => {
											return <StyledCell>{cellProps.row.original.status}</StyledCell>
										},
										size: compact ? 40 : 100,
									},
									{
										header: () => (
											<TableHeader>
												{t('leaderboard.trader-history.table.total-trades')}
											</TableHeader>
										),
										accessorKey: 'trades',
										size: compact ? 40 : 100,
									},
									{
										header: () => (
											<TableHeader>
												{t('leaderboard.trader-history.table.total-volume')}
											</TableHeader>
										),
										accessorKey: 'totalVolume',
										cell: (cellProps) => (
											<Currency.Price price={cellProps.row.original.totalVolume} />
										),
										size: compact ? 40 : 100,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
										),
										accessorKey: 'pnl',
										cell: (cellProps) => (
											<PnlContainer>
												<Currency.Price price={cellProps.row.original.pnl} colored />
												<StyledValue $value={cellProps.row.original.pnl}>
													{cellProps.row.original.pnlPct}
												</StyledValue>
											</PnlContainer>
										),
										size: compact ? 40 : 100,
									},
								],
							},
						]}
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
												<StyledFuturesIcon type={cellProps.row.original.accountType} />
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
											return <StyledCell>{cellProps.row.original.status}</StyledCell>
										},
										size: 30,
									},
									{
										header: () => (
											<TableHeader>{t('leaderboard.trader-history.table.total-pnl')}</TableHeader>
										),
										accessorKey: 'pnl',
										cell: (cellProps) => (
											<PnlContainer>
												<Currency.Price price={cellProps.row.original.pnl} colored />
												<StyledValue $value={cellProps.row.original.pnl}>
													{cellProps.row.original.pnlPct}
												</StyledValue>
											</PnlContainer>
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

const PnlContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
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
	text-align: end;
	${valueColor}
`

const StyledFuturesIcon = styled(FuturesIcon)`
	margin-left: 5px;
`

export default TraderHistory

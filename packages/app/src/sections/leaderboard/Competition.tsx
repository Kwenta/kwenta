import { formatPercent, truncateAddress } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { CompetitionRound, PIN, Tier } from 'constants/competition'
import Connector from 'containers/Connector'
import useENSs from 'hooks/useENSs'
import useGetFile from 'queries/files/useGetFile'
import { AccountStat } from 'queries/futures/types'
import { StyledTrader } from 'sections/leaderboard/trader'
import { getMedal, getCompetitionDataLocation } from 'utils/competition'

type CompetitionProps = {
	round: CompetitionRound
	activeTier: Tier
	compact?: boolean
	onClickTrader: (trader: string) => void
	searchTerm?: string | undefined
}

const Competition: FC<CompetitionProps> = ({
	round,
	activeTier,
	compact,
	onClickTrader,
	searchTerm,
}) => {
	const { t } = useTranslation()
	const { walletAddress } = Connector.useContainer()
	const competitionQuery = useGetFile(getCompetitionDataLocation(round))

	const competitionData = useMemo(
		() => (competitionQuery?.data ?? []) as AccountStat[],
		[competitionQuery]
	)

	const walletTier = useMemo(() => {
		const walletStat = competitionData.find(({ account }) => account === walletAddress)
		return walletStat ? walletStat.tier : null
	}, [walletAddress, competitionData])

	const traders = useMemo(
		() => competitionData.map((stat) => stat.account) ?? [],
		[competitionData]
	)

	const ensInfoQuery = useENSs(traders)
	const ensInfo = useMemo(() => ensInfoQuery.data ?? {}, [ensInfoQuery])

	let data = useMemo(() => {
		const cleanCompetitionData = competitionData
			.sort((a, b) => a.rank - b.rank)
			.map((trader) => {
				return {
					...trader,
					trader: trader.account,
					traderEns: ensInfo[trader.account],
					rankText: trader.rank.toString(),
					traderShort: truncateAddress(trader.account),
					pnl: wei(trader.pnl),
					pnlNumber: wei(trader.pnl).toNumber(),
					pnlPct: `(${formatPercent(trader.pnl_pct)})`,
					totalVolume: trader.volume,
					totalTrades: trader.trades,
				}
			})
			.filter((trader) => {
				return compact && !!walletTier ? trader.tier === walletTier : trader.tier === activeTier
			})
			.filter((i) =>
				searchTerm?.length
					? i.trader.toLowerCase().includes(searchTerm) ||
					  i.traderEns?.toLowerCase().includes(searchTerm)
					: true
			)

		const pinRow = cleanCompetitionData
			.filter((trader) => trader.account.toLowerCase() === walletAddress?.toLowerCase())
			.map((trader) => ({ ...trader, rankText: `${trader.rank}${PIN}` }))

		return [...pinRow, ...cleanCompetitionData]
	}, [competitionData, ensInfo, searchTerm, activeTier, walletAddress, walletTier, compact])

	return (
		<>
			<DesktopOnlyView>
				<StyledTable
					// @ts-ignore
					compact={compact}
					showPagination={!compact}
					pageSize={10}
					isLoading={competitionQuery.isLoading}
					data={data}
					hiddenColumns={!compact ? undefined : ['totalTrades', 'liquidations', 'totalVolume']}
					noResultsMessage={
						<TableNoResults>{t('leaderboard.competition.table.no-results')}</TableNoResults>
					}
					columns={[
						{
							header: () => (
								<TableTitle>
									<TitleText>{t('leaderboard.competition.title')}</TitleText>
								</TableTitle>
							),
							accessorKey: 'title',
							columns: [
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>
									),
									accessorKey: 'rank',
									sortingFn: 'basic',
									cell: (cellProps) => (
										<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
									),
									size: compact ? 100 : 60,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
									),
									accessorKey: 'trader',
									cell: (cellProps) => {
										return (
											<StyledOrderType
												onClick={() => onClickTrader(cellProps.row.original.account)}
											>
												<StyledTrader>
													{cellProps.row.original.traderEns ?? cellProps.row.original.traderShort}
												</StyledTrader>
												{getMedal(cellProps.row.original.rank)}
											</StyledOrderType>
										)
									},
									size: compact ? 180 : 120,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
									),
									accessorKey: 'totalTrades',
									sortingFn: 'basic',
									// width: compact ? 'auto' : 80,
									size: 80,
									enableSorting: true,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
									),
									accessorKey: 'liquidations',
									sortingFn: 'basic',
									// size: compact ? 'auto' : 80,
									size: 80,
									enableSorting: true,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.total-volume')}</TableHeader>
									),
									accessorKey: 'totalVolume',
									sortingFn: 'basic',
									cell: (cellProps) => (
										<Currency.Price price={cellProps.row.original.totalVolume} />
									),
									// width: compact ? 'auto' : 100,
									size: 100,
									enableSorting: true,
								},
								{
									header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
									accessorKey: 'pnlNumber',
									sortingFn: 'basic',
									cell: (cellProps) => (
										<PnlContainer direction="column">
											<ColorCodedPrice price={cellProps.row.original.pnl} />
											<StyledValue>{cellProps.row.original.pnlPct}</StyledValue>
										</PnlContainer>
									),
									size: compact ? 120 : 100,
									enableSorting: true,
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
							header: () => <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
							accessorKey: 'rank',
							cell: (cellProps) => (
								<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
							),
							size: 60,
						},
						{
							header: () => <TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>,
							accessorKey: 'trader',
							cell: (cellProps) => (
								<StyledOrderType onClick={() => onClickTrader(cellProps.row.original.account)}>
									<StyledValue>
										{cellProps.row.original.traderEns ?? cellProps.row.original.traderShort}
									</StyledValue>
									{getMedal(cellProps.row.original.rank)}
								</StyledOrderType>
							),
							size: 150,
						},
						{
							header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
							accessorKey: 'pnl',
							cell: (cellProps) => (
								<PnlContainer direction={'column'}>
									<ColorCodedPrice
										currencyKey="sUSD"
										price={cellProps.row.original.pnl}
										sign="$"
										conversionRate={1}
									/>
									<StyledValue>{cellProps.row.original.pnlPct}</StyledValue>
								</PnlContainer>
							),
							size: 125,
						},
					]}
				/>
			</MobileOrTabletView>
		</>
	)
}

const StyledTable = styled(Table)<{ compact: boolean | undefined }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
` as typeof Table

const TableTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`

const TitleText = styled.a`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const PnlContainer = styled.div<{ direction: 'row' | 'column' }>`
	display: flex;
	flex-direction: ${(props) => props.direction};
	align-items: center;
`

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	margin-right: 5px;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.selectedTheme.green
			: props.price < 0
			? props.theme.colors.selectedTheme.red
			: props.theme.colors.selectedTheme.button.text.primary};
`

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) =>
		props.color === 'green' || props.color === 'red'
			? props.theme.colors.selectedTheme[props.color]
			: props.theme.colors.selectedTheme.button.text.primary};
	margin: 0;
	text-align: end;
`

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	align-items: center;
`

export default Competition

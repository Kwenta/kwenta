import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import Table, { TableHeader } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { BANNER_HEIGHT_DESKTOP } from 'constants/announcement'
import { DEFAULT_LEADERBOARD_ROWS } from 'constants/defaults'
import useENSAvatar from 'hooks/useENSAvatar'
import { AccountStat } from 'queries/futures/types'
import { StyledTrader } from 'sections/leaderboard/trader'
import { selectShowBanner } from 'state/app/selectors'
import { useAppSelector } from 'state/hooks'
import { selectWallet } from 'state/wallet/selectors'
import { FOOTER_HEIGHT } from 'styles/common'
import media from 'styles/media'
import { getMedal } from 'utils/competition'
import { staticMainnetProvider } from 'utils/network'

type TraderCellProps = {
	onClickTrader: (trader: string) => void
	compact?: boolean
	rank: number
	traderEns?: string | null
	traderShort: string
	trader: string
}

const TraderCell: FC<TraderCellProps> = ({
	onClickTrader,
	compact,
	rank,
	traderEns,
	traderShort,
	trader,
}) => {
	const avatar = useENSAvatar(staticMainnetProvider, traderEns)

	return (
		<StyledOrderType onClick={() => onClickTrader(trader)}>
			{compact && rank + '. '}
			<StyledTrader>
				{avatar?.data ? (
					<>
						{!avatar.isLoading && avatar.data && (
							<img
								src={avatar.data}
								alt={''}
								width={16}
								height={16}
								style={{ borderRadius: '50%', marginRight: '8px' }}
								// @ts-ignore
								onError={(err) => (err.target.style.display = 'none')}
							/>
						)}
						{traderEns}
					</>
				) : (
					traderEns ?? traderShort
				)}
			</StyledTrader>
			{getMedal(rank)}
		</StyledOrderType>
	)
}

type AllTimeProps = {
	stats: (AccountStat & { traderEns: string; rankText: string })[]
	isLoading: boolean
	pinRow: (AccountStat & { rankText: string })[]
	onClickTrader: (trader: string) => void
	compact?: boolean
	activeTab?: string
}

const AllTime: FC<AllTimeProps> = ({
	stats,
	isLoading,
	pinRow,
	onClickTrader,
	compact,
	activeTab,
}) => {
	const { t } = useTranslation()
	const walletAddress = useAppSelector(selectWallet)
	const showBanner = useAppSelector(selectShowBanner)

	if (compact) {
		const ownPosition = stats.findIndex((i) => {
			return i.account.toLowerCase() === walletAddress?.toLowerCase()
		})

		const anchorPosition = ownPosition !== -1 && ownPosition > 10 ? stats[ownPosition] : null

		stats = stats.slice(0, 10)

		if (anchorPosition) {
			stats.push(anchorPosition)
		}
	}

	const data = useMemo(() => {
		return [...pinRow, ...stats]
	}, [stats, pinRow])

	const tableHeight = useMemo(
		() => window.innerHeight - FOOTER_HEIGHT - 161 - Number(showBanner) * BANNER_HEIGHT_DESKTOP,
		[showBanner]
	)

	return (
		<>
			<MobileHiddenView>
				<StyledTable
					// @ts-ignore
					height={tableHeight}
					compact={compact}
					showPagination
					isLoading={isLoading}
					data={data}
					pageSize={10}
					hideHeaders={compact}
					// hiddenColumns={
					// 	compact ? ['rank', 'totalTrades', 'liquidations', 'totalVolume', 'pnl'] : undefined
					// }
					columnVisibility={{
						rank: !compact,
						totalTrades: !compact,
						liquidations: !compact,
						totalVolume: !compact,
						pnl: !compact,
					}}
					columnsDeps={[activeTab]}
					columns={[
						{
							header: () => (
								<TableTitle>
									<TitleText>
										{activeTab} {t('leaderboard.leaderboard.table.title')}
									</TitleText>
								</TableTitle>
							),
							accessorKey: 'title',
							columns: [
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>
									),
									accessorKey: 'rank',
									cell: (cellProps) => (
										<StyledOrderType>{cellProps.row.original.rankText}</StyledOrderType>
									),
									size: compact ? 40 : 60,
								},
								{
									header: () =>
										!compact ? (
											<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
										) : (
											<></>
										),
									accessorKey: 'trader',
									cell: (cellProps) => {
										return (
											<TraderCell
												onClickTrader={onClickTrader}
												compact={compact}
												rank={cellProps.row.original.rank}
												traderEns={cellProps.row.original.traderEns}
												traderShort={cellProps.row.original.traderShort}
												trader={cellProps.row.original.trader}
											/>
										)
									},
									size: 120,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
									),
									accessorKey: 'totalTrades',
									size: 80,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
									),
									accessorKey: 'liquidations',
									size: 80,
								},
								{
									header: () => (
										<TableHeader>{t('leaderboard.leaderboard.table.total-volume')}</TableHeader>
									),
									accessorKey: 'totalVolume',
									cell: (cellProps) => (
										<Currency.Price price={cellProps.row.original.totalVolume} />
									),
									// size: compact ? 'auto' : 100,
									size: 100,
								},
								{
									header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
									accessorKey: 'pnl',
									cell: (cellProps) => (
										<Currency.Price
											currencyKey="sUSD"
											price={cellProps.row.original.pnl}
											sign="$"
											conversionRate={1}
											colored={true}
										/>
									),
									// size: compact ? 'auto' : 100,
									size: 100,
								},
							],
						},
					]}
				/>
			</MobileHiddenView>
			<MobileOnlyView>
				<StyledTable
					// @ts-ignore
					compact={compact}
					data={data}
					showPagination
					pageSize={DEFAULT_LEADERBOARD_ROWS}
					isLoading={false}
					hideHeaders={compact}
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
							cell: (cellProps) => {
								return (
									<TraderCell
										onClickTrader={onClickTrader}
										compact={compact}
										rank={cellProps.row.original.rank}
										traderEns={cellProps.row.original.traderEns}
										traderShort={cellProps.row.original.traderShort}
										trader={cellProps.row.original.trader}
									/>
								)
							},
							size: 150,
						},
						{
							header: () => <TableHeader>{t('leaderboard.leaderboard.table.pnl')}</TableHeader>,
							accessorKey: 'pnl',
							cell: (cellProps) => (
								<Currency.Price
									currencyKey="sUSD"
									price={cellProps.row.original.pnl}
									sign="$"
									colored
								/>
							),
							size: 125,
						},
					]}
				/>
			</MobileOnlyView>
		</>
	)
}

const StyledTable = styled(Table)<{ compact: boolean | undefined; height?: number }>`
	margin-top: ${({ compact }) => (compact ? '0' : '15px')};
	height: ${({ height }) => (height ? height + 'px' : 'auto')};
	max-height: 665px;

	${TableCell} {
		padding-top: 8px;
		padding-bottom: 8px;
	}

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
	justify-content: space-between;
`

const TitleText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	text-transform: capitalize;
`

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	align-items: center;
`

export default AllTime

import { FuturesMarketKey, FuturesPositionHistory } from '@kwenta/sdk/types'
import Wei, { wei, WeiSource } from '@synthetixio/wei'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Currency from 'components/Currency'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDiv, FlexDivCol } from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Table, { TableHeader, TableNoResults } from 'components/Table'
import { TableCell } from 'components/Table/TableBodyRow'
import { Body } from 'components/Text'
import TimeDisplay from 'sections/futures/Trades/TimeDisplay'
import { selectQueryStatuses } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import media from 'styles/media'

type PositionData = FuturesPositionHistory & {
	rank: number
	currencyIconKey: FuturesMarketKey
	marketShortName: string
	status: string
	funding: Wei
	pnl: Wei
	pnlPct: string
}

type TraderHistoryProps = {
	trader: string
	traderEns?: string | null
	positionHistory: PositionData[]
	resetSelection: () => void
	compact?: boolean
	searchTerm?: string | undefined
}

const TraderHistory: FC<TraderHistoryProps> = memo(({ positionHistory, compact, searchTerm }) => {
	const { t } = useTranslation()
	const { selectedTraderPositionHistory: queryStatus } = useAppSelector(selectQueryStatuses)

	let data = useMemo(() => {
		return positionHistory.filter((i) =>
			searchTerm?.length
				? i.marketShortName.toLowerCase().includes(searchTerm) ||
				  i.status.toLowerCase().includes(searchTerm)
				: true
		)
	}, [positionHistory, searchTerm])

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
					paginationSize={'sm'}
					columns={[
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
				<MobileTable
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
							accessorKey: 'asset',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('leaderboard.trader-history.mobile-table.market')}</TableHeader>
									<CurrencyInfo>
										<MobileCurrencyIcon currencyKey={cellProps.row.original.currencyIconKey} />
										<StyledSubtitle>{cellProps.row.original.marketShortName}</StyledSubtitle>
									</CurrencyInfo>
								</>
							),
						},
						{
							accessorKey: 'totalVolume',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('leaderboard.trader-history.mobile-table.volume')}</TableHeader>
									<RightAlignedContainer>
										<Currency.Price price={cellProps.getValue()} />
									</RightAlignedContainer>
								</>
							),
						},
						{
							accessorKey: 'status',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('leaderboard.trader-history.mobile-table.status')}</TableHeader>
									<Body color="primary">{cellProps.row.original.status}</Body>
								</>
							),
						},
						{
							accessorKey: 'funding',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('leaderboard.trader-history.mobile-table.funding')}</TableHeader>
									<RightAlignedContainer>
										<Currency.Price price={cellProps.getValue()} colored />
									</RightAlignedContainer>
								</>
							),
						},
						{
							accessorKey: 'pnl',
							cell: (cellProps) => (
								<>
									<TableHeader>{t('leaderboard.trader-history.mobile-table.pnl')}</TableHeader>
									<FlexDivCol style={{ textAlign: 'right' }}>
										<Currency.Price price={cellProps.row.original.pnl} colored />
										<StyledValue $value={cellProps.row.original.pnl}>
											{cellProps.row.original.pnlPct}
										</StyledValue>
									</FlexDivCol>
								</>
							),
						},
						{
							accessorKey: 'openTimestamp',
							cell: (cellProps) => {
								return (
									<>
										<TableHeader>
											{t('leaderboard.trader-history.mobile-table.timestamp')}
										</TableHeader>
										<StyledCell>
											<TimeDisplay shortDate value={cellProps.row.original.openTimestamp} />
										</StyledCell>
									</>
								)
							},
						},
					]}
				/>
			</MobileOrTabletView>
		</>
	)
})

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
		margin-bottom: 15px;
	`}
` as typeof Table

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

const StyledCell = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;
	padding-top: 5px;
	padding-bottom: 5px;
`

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 5px;
`

const MobileCurrencyIcon = styled(CurrencyIcon)`
	& > img {
		width: 20px;
		height: 20px;
	}
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

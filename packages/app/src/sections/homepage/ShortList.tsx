import { formatDollars, formatNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import GridSvg from 'assets/svg/app/grid.svg'
import Button from 'components/Button'
import Currency from 'components/Currency'
import { FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import Loader from 'components/Loader'
import { MobileOnlyView, NotMobileView } from 'components/Media'
import Table, { TableHeader } from 'components/Table'
import { Body } from 'components/Text'
import ROUTES from 'constants/routes'
import useGetFuturesCumulativeStats from 'queries/futures/useGetFuturesCumulativeStats'
import { StackSection } from 'sections/homepage/section'
import { Title } from 'sections/homepage/text'
import { fetchFuturesStats } from 'state/home/actions'
import { useAppSelector, useFetchAction } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { SmallGoldenHeader, WhiteHeader } from 'styles/common'
import media from 'styles/media'

import TraderENS from './TraderENS'

const getMedal = (position: number) => {
	switch (position) {
		case 1:
			return <Medal>🥇</Medal>
		case 2:
			return <Medal>🥈</Medal>
		case 3:
			return <Medal>🥉</Medal>
		default:
			return <Medal> {position} </Medal>
	}
}

const ShortList = () => {
	const { t } = useTranslation()

	const { loading, stats } = useAppSelector(({ home }) => ({
		loading: home.futuresStatsQueryStatus === FetchStatus.Loading,
		stats: home.futuresStats,
	}))

	const router = useRouter()

	const onClickTrader = useCallback(
		(trader: string) => {
			router.push(ROUTES.Leaderboard.Trader(trader))
		},
		[router]
	)

	useFetchAction(fetchFuturesStats)

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.shortlist.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.shortlist.description')}</WhiteHeader>
		</>
	)

	const sectionTitle = (
		<>
			<SectionFeatureTitle>{t('homepage.shortlist.stats.title')}</SectionFeatureTitle>
		</>
	)

	const totalTradeStats = useGetFuturesCumulativeStats()

	return (
		<StackSection>
			<Container>
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<NotMobileView>
					<StyledTable
						isLoading={loading}
						onTableRowClick={(row) => onClickTrader(row.original.trader)}
						data={stats}
						pageSize={5}
						hideHeaders={false}
						highlightRowsOnHover
						columns={[
							{
								header: () => <TableHeader>{t('leaderboard.leaderboard.table.rank')}</TableHeader>,
								accessorKey: 'rank',
								cell: (cellProps) => (
									<StyledOrderType>{getMedal(cellProps.row.original.rank)}</StyledOrderType>
								),
								size: 65,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
								),
								accessorKey: 'trader',
								cell: (cellProps) => {
									return (
										<TraderENS
											trader={cellProps.row.original.trader}
											traderShort={cellProps.row.original.traderShort}
											shortlist
										/>
									)
								},
								size: 150,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.total-trades')}</TableHeader>
								),
								accessorKey: 'totalTrades',
								cell: (cellProps) => <Body size="large">{cellProps.row.original.totalTrades}</Body>,
								size: 100,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.liquidations')}</TableHeader>
								),
								accessorKey: 'liquidations',
								cell: (cellProps) => (
									<Body size="large">{cellProps.row.original.liquidations}</Body>
								),
								size: 100,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>
								),
								accessorKey: 'pnl',
								cell: (cellProps) => <ColorCodedPrice price={wei(cellProps.row.original.pnl)} />,
								size: 125,
							},
						]}
					/>
				</NotMobileView>
				<MobileOnlyView>
					<StyledTable
						isLoading={loading}
						onTableRowClick={(row) => onClickTrader(row.original.trader)}
						data={stats}
						pageSize={5}
						hideHeaders={false}
						highlightRowsOnHover
						columns={[
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.rank-mobile')}</TableHeader>
								),
								accessorKey: 'rank',
								cell: (cellProps) => (
									<StyledOrderType>{getMedal(cellProps.row.original.rank)}</StyledOrderType>
								),
								size: 45,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.trader')}</TableHeader>
								),
								accessorKey: 'trader',
								cell: (cellProps) => {
									return (
										<TraderENS
											trader={cellProps.row.original.trader}
											traderShort={cellProps.row.original.traderShort}
											shortlist
										/>
									)
								},
								size: 150,
							},
							{
								header: () => (
									<TableHeader>{t('leaderboard.leaderboard.table.total-pnl')}</TableHeader>
								),
								accessorKey: 'pnl',
								cell: (cellProps) => <ColorCodedPrice price={cellProps.row.original.pnl} />,
								size: 125,
							},
						]}
					/>
				</MobileOnlyView>
				<FlexDivColCentered>{sectionTitle}</FlexDivColCentered>
				<StatsCardContainer>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.volume')}</StatsName>
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatDollars(wei(totalTradeStats.data?.totalVolume || '0'), {
									minDecimals: 0,
								})
							)}
						</StatsValue>
						<GridSvg />
					</StatsCard>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.traders')}</StatsName>
						<StatsValue>
							{totalTradeStats.isLoading ? <Loader /> : totalTradeStats.data?.totalTraders ?? 0}
						</StatsValue>
						<GridSvg />
					</StatsCard>
					<StatsCard>
						<StatsName>{t('homepage.shortlist.stats.trades')}</StatsName>
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatNumber(totalTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })
							)}
						</StatsValue>
						<GridSvg />
					</StatsCard>
				</StatsCardContainer>
			</Container>
		</StackSection>
	)
}

const StatsName = styled.div`
	font-size: 15px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`

const StatsValue = styled.div`
	font-size: 32px;
	color: ${(props) => props.theme.colors.selectedTheme.white};
`

const StatsCardContainer = styled(FlexDivRow)`
	margin-top: 40px;
	justify-content: center;
	column-gap: 20px;

	${media.lessThan('lgUp')`
		flex-wrap: wrap;
		row-gap: 20px;
	`}

	${media.lessThan('sm')`
		flex-direction: column;
		margin: auto;
		padding: 0px;
		row-gap: 15px;
		margin-top: 30px;
	`}
`

const StatsCard = styled(Button)`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 291px;
	height: 191px;
	font-family: ${(props) => props.theme.fonts.regular};
	border-radius: 15px;
	justify-content: center;
	&::before {
		border-radius: 15px;
	}
	cursor: default;
	transition: all 1s ease-in-out;

	&:hover {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	}

	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	svg {
		width: 291px;
		height: 75px;
		position: absolute;
		right: 0;
		top: 0;

		margin-top: 115px;
		z-index: 20;
		background-size: cover;
	}
`

const StyledTable = styled(Table)`
	margin-top: 60px;
	font-size: 15px;
	width: 1160px;
	background: #131212;

	${media.lessThan('lgUp')`
		width: 720px;
	`}

	${media.lessThan('sm')`
		width: 345px;
		& > .table-body >.table-body-row >.table-body-cell {
			padding-left: 0px;
		}
	`};
` as typeof Table

const Medal = styled.span`
	font-size: 15px;
`

const ColorCodedPrice = styled(Currency.Price)`
	align-items: right;
	color: ${(props) =>
		props.price > 0
			? props.theme.colors.green
			: props.price < 0
			? props.theme.colors.red
			: props.theme.colors.white};
	font-size: 15px;
`

const Container = styled(FlexDivColCentered)`
	padding-bottom: 140px;
	justify-content: center;
`

const StyledOrderType = styled.div`
	color: ${(props) => props.theme.colors.white};
	text-align: center;
	width: 45px;
`

const FeatureTitle = styled(Title)`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 22px;
	font-variant: all-small-caps;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	width: 150px;
	letter-spacing: 2px;
`

const SectionFeatureTitle = styled(FeatureTitle)`
	font-size: 20px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.black};
	font-variant: all-small-caps;
	letter-spacing: 0px;
	margin-top: 100px;
	text-align: center;
	width: auto;
	${media.lessThan('sm')`
		width: 100vw;
	`}
`

export default ShortList

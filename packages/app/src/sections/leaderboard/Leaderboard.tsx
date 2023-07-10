import { getAddress, isAddress } from 'ethers/lib/utils'
import DOMPurify from 'isomorphic-dompurify'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { FlexDivCol } from 'components/layout/flex'
import Search from 'components/Table/Search'
import { CompetitionRound, COMPETITION_TIERS, PIN, Tier } from 'constants/competition'
import ROUTES from 'constants/routes'
import useENS from 'hooks/useENS'
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner'
import { setSelectedTrader } from 'state/futures/reducer'
import { selectSelectedTrader } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector, useFetchAction } from 'state/hooks'
import { fetchLeaderboard } from 'state/stats/actions'
import { selectLeaderboard, selectLeaderboardLoading } from 'state/stats/selectors'
import media from 'styles/media'

import AllTime from './AllTime'
import Competition from './Competition'
import TraderHistory from './TraderHistory'

type LeaderboardProps = {
	compact?: boolean
	mobile?: boolean
}

enum LeaderboardTab {
	Top = 'top',
	Bottom = 'bottom',
}

const LEADERBOARD_TABS = [LeaderboardTab.Top, LeaderboardTab.Bottom]

const Leaderboard: FC<LeaderboardProps> = ({ compact, mobile }) => {
	const router = useRouter()
	const dispatch = useAppDispatch()

	const [activeTab, setActiveTab] = useState(LeaderboardTab.Top)
	const [activeTier, setActiveTier] = useState<Tier>('bronze')
	const [competitionRound, setCompetitionRound] = useState<CompetitionRound>()
	const [searchInput, setSearchInput] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [searchAddress, setSearchAddress] = useState('')
	const selectedTrader = useAppSelector(selectSelectedTrader)
	const searchEns = useENS(searchTerm)

	const leaderboardLoading = useAppSelector(selectLeaderboardLoading)
	const leaderboardData = useAppSelector(selectLeaderboard)

	// TODO: Separate search from the general list, to improve performance.
	// This currently refetches the whole list when we search.

	useFetchAction(() => fetchLeaderboard(searchTerm), { dependencies: [searchTerm] })

	const pinRow = useMemo(() => {
		return leaderboardData.wallet.map((trader) => ({ ...trader, rank: 0, rankText: PIN }))
	}, [leaderboardData.wallet])

	const urlPath = DOMPurify.sanitize(router.asPath)
	const trader = DOMPurify.sanitize(router.query.trader as string)
	const compRound =
		router.query.competitionRound && typeof router.query.competitionRound === 'string'
			? (DOMPurify.sanitize(router.query.competitionRound) as CompetitionRound)
			: null

	useMemo(() => {
		if (urlPath.startsWith(ROUTES.Leaderboard.Home) && trader) {
			dispatch(
				setSelectedTrader({
					trader,
					traderEns: leaderboardData.all.find((a) => a.account === trader)?.traderEns,
				})
			)
		} else if (urlPath.startsWith(ROUTES.Leaderboard.Home) && compRound) {
			setCompetitionRound(compRound)
		} else {
			setSearchInput('')
			setSearchTerm('')
			setSearchAddress('')
			dispatch(setSelectedTrader(undefined))
			setCompetitionRound(null)
		}
		return null
	}, [compRound, trader, urlPath, dispatch, leaderboardData.all])

	const onChangeSearch = (text: string) => {
		setSearchInput(text.toLowerCase())

		if (isAddress(text)) {
			setSearchTerm(getAddress(text))
		} else if (text.endsWith('.eth')) {
			setSearchTerm(text)
		} else {
			setSearchTerm('')
		}
	}

	const onClickTrader = useCallback(
		(trader: string, traderEns?: string) => {
			setSearchInput('')
			setSearchTerm('')
			setSearchAddress('')
			dispatch(setSelectedTrader({ trader, traderEns }))
			router.push(ROUTES.Leaderboard.Trader(trader))
		},
		[router, dispatch]
	)

	const resetSelection = useCallback(() => {
		setSearchInput('')
		setSearchTerm('')
		setSearchAddress('')
		dispatch(setSelectedTrader(undefined))

		if (competitionRound) {
			router.push(ROUTES.Leaderboard.Competition(competitionRound))
		} else {
			router.push(ROUTES.Leaderboard.Home)
		}
	}, [competitionRound, router, dispatch])

	const handleSelectTab = useCallback(
		(tab: LeaderboardTab) => () => {
			setActiveTab(tab)
			dispatch(setSelectedTrader(undefined))
		},
		[dispatch]
	)

	const handleSelectTier = useCallback(
		(tier: Tier) => () => {
			setActiveTier(tier)
			dispatch(setSelectedTrader(undefined))
		},
		[dispatch]
	)

	useEffect(() => {
		setSearchAddress(searchEns.ensAddress ?? (isAddress(searchTerm) ? searchTerm : ''))
	}, [searchTerm, searchEns])

	return (
		<>
			<CompetitionBanner compact hideBanner={compact} />
			<LeaderboardContainer>
				<SearchContainer compact={compact} mobile={mobile}>
					<TabButtonContainer numItems={competitionRound ? 3 : 2} mobile={mobile}>
						{competitionRound
							? COMPETITION_TIERS.map((tier) => (
									<StyledTabButton
										key={tier}
										title={tier ?? ''}
										active={activeTier === tier}
										onClick={handleSelectTier(tier)}
									/>
							  ))
							: LEADERBOARD_TABS.map((tab) => (
									<StyledTabButton
										key={tab}
										title={tab ?? ''}
										active={activeTab === tab}
										onClick={handleSelectTab(tab)}
									/>
							  ))}
					</TabButtonContainer>
					<SearchBarContainer>
						<Search value={searchInput} onChange={onChangeSearch} disabled={false} />
					</SearchBarContainer>
				</SearchContainer>
				<TableContainer compact={compact}>
					{!compact && selectedTrader ? (
						<TraderHistory
							trader={selectedTrader.trader}
							traderEns={selectedTrader.traderEns}
							resetSelection={resetSelection}
							compact={compact}
							searchTerm={searchInput}
						/>
					) : competitionRound ? (
						<Competition
							round={competitionRound}
							activeTier={activeTier}
							compact={compact}
							onClickTrader={onClickTrader}
							searchTerm={searchTerm !== '' ? searchTerm : searchInput}
						/>
					) : searchAddress ? (
						<AllTime
							stats={leaderboardData.search}
							isLoading={leaderboardLoading}
							compact={compact}
							onClickTrader={onClickTrader}
							pinRow={pinRow}
						/>
					) : (
						<AllTime
							stats={leaderboardData[activeTab]}
							isLoading={leaderboardLoading}
							compact={compact}
							onClickTrader={onClickTrader}
							pinRow={pinRow}
							activeTab={activeTab}
						/>
					)}
				</TableContainer>
			</LeaderboardContainer>
		</>
	)
}

const LeaderboardContainer = styled(FlexDivCol)`
	min-width: 400px;
	${media.lessThan('sm')`
		min-width: unset;
	`}
`

const StyledTabButton = styled(TabButton)`
	min-width: 65px;
	height: 35px;
	margin-right: 5px;
`

const TabButtonContainer = styled.div<{ numItems: number; mobile?: boolean }>`
	display: grid;
	grid-template-columns: ${({ numItems }) => `repeat(${numItems}, 1fr)`};
	margin-bottom: ${({ mobile }) => (mobile ? '16px' : '0px')};
	column-gap: 15px;
`

const SearchContainer = styled.div<{ compact?: boolean; mobile?: boolean }>`
	display: ${({ compact }) => (compact ? 'none' : 'flex')};
	flex-direction: ${({ mobile }) => (mobile ? 'column' : 'row')};
	margin-top: ${({ compact }) => (compact ? '0px' : '16px')};
	column-gap: 15px;
`

const SearchBarContainer = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
`

const TableContainer = styled.div<{ compact?: boolean }>`
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`

export default Leaderboard

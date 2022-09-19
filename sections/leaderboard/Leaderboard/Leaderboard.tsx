import { useRouter } from 'next/router';
import { FC, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';
import useENSs from 'hooks/useENSs';
import { AccountStat } from 'queries/futures/types';
import useGetStats from 'queries/futures/useGetStats';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { isCompetitionActive } from 'store/ui';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import AllTime from '../AllTime';
import { COMPETITION_TIERS, Tier } from '../common';
import Competition from '../Competition';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
	mobile?: boolean;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact, mobile }: LeaderboardProps) => {
	const competitionActive = useRecoilValue(isCompetitionActive);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeTier, setActiveTier] = useState<Tier>(competitionActive ? 'bronze' : null);
	const [selectedTrader, setSelectedTrader] = useState('');
	const router = useRouter();

	const statsQuery = useGetStats();
	const statsData = useMemo(() => statsQuery.data ?? [], [statsQuery]);

	const traders = useMemo(
		() =>
			statsData.map((stat: AccountStat) => {
				return stat.account;
			}) ?? [],
		[statsData]
	);
	const ensInfoQuery = useENSs(traders);
	const ensInfo = useMemo(() => ensInfoQuery.data ?? {}, [ensInfoQuery]);

	let stats: AccountStat[] = useMemo(() => {
		return statsData.map((stat: AccountStat) => ({
			...stat,
			traderEns: ensInfo[stat.account] ?? null,
		}));
	}, [statsData, ensInfo]);

	useMemo(() => {
		if (router.asPath.startsWith(ROUTES.Leaderboard.Home) && router.query.trader) {
			const trader = router.query.trader as string;
			setSelectedTrader(trader);
		} else {
			setSearchTerm('');
			setSelectedTrader('');
		}
		return null;
	}, [router.query, router.asPath]);

	const onChangeSearch = (text: string) => {
		setSearchTerm(text?.toLowerCase());
	};

	const onClickTrader = (trader: string) => {
		setSearchTerm('');
		setSelectedTrader(trader);
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	const resetSelection = () => {
		setSearchTerm('');
		setSelectedTrader('');
		router.push(ROUTES.Leaderboard.Home);
	};

	return (
		<>
			<CompetitionBanner compact={true} hideBanner={compact} />
			<LeaderboardContainer>
				<SearchContainer compact={compact} mobile={mobile}>
					{competitionActive && (
						<TabButtonContainer mobile={mobile}>
							{COMPETITION_TIERS.map((tier) => (
								<StyledTabButton
									key={tier}
									title={tier ?? ''}
									active={activeTier === tier}
									onClick={() => {
										setActiveTier(tier);
										setSelectedTrader('');
									}}
								/>
							))}
							<StyledTabButton
								key={'All'}
								title={'All'}
								active={!activeTier}
								onClick={() => {
									setActiveTier(null);
									setSelectedTrader('');
								}}
							/>
						</TabButtonContainer>
					)}
					<SearchBarContainer>
						<Search value={searchTerm} onChange={onChangeSearch} disabled={false} />
					</SearchBarContainer>
				</SearchContainer>
				<TableContainer compact={compact}>
					{!compact && selectedTrader !== '' ? (
						<TraderHistory
							trader={selectedTrader}
							ensInfo={ensInfo}
							resetSelection={resetSelection}
							compact={compact}
							searchTerm={searchTerm}
						/>
					) : activeTier ? (
						<Competition
							activeTier={activeTier}
							ensInfo={ensInfo}
							compact={compact}
							onClickTrader={onClickTrader}
							searchTerm={searchTerm}
						/>
					) : (
						<AllTime
							stats={stats}
							isLoading={statsQuery.isLoading}
							compact={compact}
							onClickTrader={onClickTrader}
							searchTerm={searchTerm}
						/>
					)}
				</TableContainer>
			</LeaderboardContainer>
		</>
	);
};

const LeaderboardContainer = styled(FlexDivCol)`
	min-width: 400px;
	${media.lessThan('sm')`
		min-width: unset;
	`}
`;

const StyledTabButton = styled(TabButton)`
	min-width: 65px;
	height: 35px;
	margin-right: 5px;
`;

const TabButtonContainer = styled.div<{ mobile?: boolean }>`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	margin-bottom: ${({ mobile }) => (mobile ? '16px' : '0px')};
`;

const SearchContainer = styled.div<{ compact?: boolean; mobile?: boolean }>`
	display: ${({ compact }) => (compact ? 'none' : 'flex')};
	flex-direction: ${({ mobile }) => (mobile ? 'column' : 'row')};
	margin-top: ${({ compact }) => (compact ? '0px' : '16px')};
`;

const SearchBarContainer = styled.div`
	display: flex;
	height: 35px;
	width: 100%;
`;

const TableContainer = styled.div<{ compact?: boolean }>`
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`;

export default Leaderboard;

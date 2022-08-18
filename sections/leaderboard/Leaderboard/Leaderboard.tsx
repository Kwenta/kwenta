import { wei } from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';
import useENSs from 'hooks/useENSs';
import { FuturesStat } from 'queries/futures/types';
import useGetStats from 'queries/futures/useGetStats';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';
import { truncateAddress } from 'utils/formatters/string';

import AllTime from '../AllTime';
import { AccountStat, COMPETITION_TIERS, Tier } from '../common';
import Competition from '../Competition';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [activeTier, setActiveTier] = useState<Tier>('bronze');
	const [selectedTrader, setSelectedTrader] = useState('');
	const router = useRouter();

	const statsQuery = useGetStats();
	const statsData = useMemo(() => statsQuery.data ?? [], [statsQuery]);

	const traders = useMemo(
		() =>
			statsData.map((stat: FuturesStat) => {
				return stat.account;
			}) ?? [],
		[statsData]
	);
	const ensInfoQuery = useENSs(traders);
	const ensInfo = useMemo(() => ensInfoQuery.data ?? {}, [ensInfoQuery]);

	let stats: AccountStat[] = useMemo(() => {
		return statsData
			.map((stat: FuturesStat) => ({
				account: stat.account,
				trader: stat.account,
				traderShort: truncateAddress(stat.account),
				traderEns: ensInfo[stat.account] ?? null,
				totalTrades: stat.totalTrades,
				totalVolume: wei(stat.totalVolume, 18, true).toNumber(),
				liquidations: stat.liquidations,
				pnl: wei(stat.pnlWithFeesPaid, 18, true).toNumber(),
			}))
			.filter((stat: FuturesStat) => stat.totalVolume > 0)
			.sort((a: FuturesStat, b: FuturesStat) => (b?.pnl || 0) - (a?.pnl || 0))
			.map((stat: FuturesStat, i: number) => ({
				rank: i + 1,
				...stat,
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
				<SearchContainer compact={compact}>
					<TabButtonContainer>
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
					<Search value={searchTerm} onChange={onChangeSearch} disabled={false} />
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
							isLoading={statsQuery.isLoading || ensInfoQuery.isLoading}
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

const TabButtonContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
`;

const SearchContainer = styled.div<{ compact: boolean | undefined }>`
	display: ${({ compact }) => (compact ? 'none' : 'flex')};
	margin-top: ${({ compact }) => (compact ? '0' : '16px')};
	height: 35px;
`;

const TableContainer = styled.div<{ compact: boolean | undefined }>`
	margin-top: ${({ compact }) => (compact ? '0' : '6px')};
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`;

export default Leaderboard;

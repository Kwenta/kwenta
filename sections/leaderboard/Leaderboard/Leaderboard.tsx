import { getAddress, isAddress } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';
import useENS from 'hooks/useENS';
import useENSs from 'hooks/useENSs';
import { AccountStat } from 'queries/futures/types';
import useLeaderboard, { DEFAULT_LEADERBOARD_DATA } from 'queries/futures/useLeaderboard';
import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';

import AllTime from '../AllTime';
import { PIN } from '../common';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
	mobile?: boolean;
};

enum LeaderboardTab {
	Top = 'top',
	Bottom = 'bottom',
}

const LEADERBOARD_TABS = [LeaderboardTab.Top, LeaderboardTab.Bottom];

const Leaderboard: FC<LeaderboardProps> = ({ compact, mobile }: LeaderboardProps) => {
	const [activeTab, setActiveTab] = useState<LeaderboardTab>(LeaderboardTab.Top);
	const [searchInput, setSearchInput] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [searchAddress, setSearchAddress] = useState('');
	const [selectedTrader, setSelectedTrader] = useState('');
	const searchEns = useENS(searchTerm);
	const router = useRouter();

	const leaderboardQuery = useLeaderboard(searchAddress);
	const leaderboardData = useMemo(() => leaderboardQuery.data ?? DEFAULT_LEADERBOARD_DATA, [
		leaderboardQuery,
	]);

	const traders = useMemo(
		() =>
			leaderboardData.all?.map((stat: AccountStat) => {
				return stat.account;
			}) ?? [],
		[leaderboardData]
	);

	const ensInfoQuery = useENSs(traders);
	const ensInfo = useMemo(() => ensInfoQuery.data ?? {}, [ensInfoQuery]);

	const pinRow: AccountStat[] = useMemo(() => {
		return leaderboardData.wallet
			? leaderboardData.wallet.map((trader) => ({
					...trader,
					rankText: PIN,
			  }))
			: [];
	}, [leaderboardData.wallet]);

	useMemo(() => {
		if (router.asPath.startsWith(ROUTES.Leaderboard.Home) && router.query.trader) {
			const trader = router.query.trader as string;
			setSelectedTrader(trader);
		} else {
			setSearchInput('');
			setSearchTerm('');
			setSearchAddress('');
			setSelectedTrader('');
		}
		return null;
	}, [router.query, router.asPath]);

	const onChangeSearch = async (text: string) => {
		setSearchInput(text?.toLowerCase());

		if (isAddress(text)) {
			setSearchTerm(getAddress(text));
		} else if (text.endsWith('.eth')) {
			setSearchTerm(text);
		} else {
			setSearchTerm('');
		}
	};

	const onClickTrader = (trader: string) => {
		setSearchInput('');
		setSearchTerm('');
		setSearchAddress('');
		setSelectedTrader(trader);
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	const resetSelection = () => {
		setSearchInput('');
		setSearchTerm('');
		setSearchAddress('');
		setSelectedTrader('');
		router.push(ROUTES.Leaderboard.Home);
	};

	useEffect(() => {
		setSearchAddress(
			searchEns.ensAddress ? searchEns.ensAddress : isAddress(searchTerm) ? searchTerm : ''
		);
	}, [searchTerm, searchEns]);

	const mapEnsName = useCallback(
		(stat: AccountStat) => ({
			...stat,
			traderEns: ensInfo[stat.account] ?? null,
		}),
		[ensInfo]
	);

	const stats = useMemo(() => {
		return {
			top: leaderboardData.top.map(mapEnsName),
			bottom: leaderboardData.bottom.map(mapEnsName),
			wallet: leaderboardData.wallet.map(mapEnsName),
			search: leaderboardData.search.map(mapEnsName),
			all: leaderboardData.all.map(mapEnsName),
		};
	}, [leaderboardData, ensInfo, mapEnsName]);

	return (
		<>
			<CompetitionBanner compact={true} hideBanner={compact} />
			<LeaderboardContainer>
				<SearchContainer compact={compact} mobile={mobile}>
					<TabButtonContainer mobile={mobile}>
						{LEADERBOARD_TABS.map((tab) => (
							<StyledTabButton
								key={tab}
								title={tab ?? ''}
								active={activeTab === tab}
								onClick={() => {
									setActiveTab(tab);
									setSelectedTrader('');
								}}
							/>
						))}
					</TabButtonContainer>
					<SearchBarContainer>
						<Search value={searchInput} onChange={onChangeSearch} disabled={false} />
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
					) : searchTerm ? (
						<AllTime
							stats={stats.search ?? []}
							isLoading={leaderboardQuery.isLoading}
							compact={compact}
							onClickTrader={onClickTrader}
							pinRow={pinRow}
						/>
					) : (
						<AllTime
							stats={stats[activeTab] ?? []}
							isLoading={leaderboardQuery.isLoading}
							compact={compact}
							onClickTrader={onClickTrader}
							pinRow={pinRow}
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
	grid-template-columns: repeat(2, 1fr);
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

import { useRouter } from 'next/router';
import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';

import AllTime from '../AllTime';
import { COMPETITION_TIERS, Tier } from '../common';
import Competition from '../Competition';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [activeTier, setActiveTier] = useState<Tier>('bronze');
	const [selectedTrader, setSelectedTrader] = useState('');
	const [traderENSName, setTraderENSName] = useState<string | null>(null);
	const router = useRouter();

	useMemo(() => {
		if (router.query.tab) {
			const trader = router.query.tab[0];
			setSelectedTrader(trader);
		} else {
			setSearchTerm('');
			setSelectedTrader('');
		}
		return null;
	}, [router.query]);

	const onChangeSearch = (text: string) => {
		setSearchTerm(text?.toLowerCase());
	};

	const onClickTrader = (trader: string, ensName: string | null) => {
		setSearchTerm('');
		setSelectedTrader(trader);
		setTraderENSName(ensName);
		router.push(ROUTES.Leaderboard.Trader(trader));
	};

	return (
		<>
			<SearchContainer>
				<TabButtonContainer>
					{COMPETITION_TIERS.map((tier) => (
						<StyledTabButton
							key={tier}
							title={tier ?? ''}
							active={activeTier === tier}
							onClick={() => setActiveTier(tier)}
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
				{activeTier ? (
					<Competition
						activeTier={activeTier}
						resetSelection={() => setSelectedTrader('')}
						compact={compact}
						searchTerm={searchTerm}
					/>
				) : selectedTrader !== '' ? (
					<TraderHistory
						trader={selectedTrader}
						traderENSName={traderENSName}
						resetSelection={() => setSelectedTrader('')}
						compact={compact}
						searchTerm={searchTerm}
					/>
				) : (
					<AllTime compact={compact} onClickTrader={onClickTrader} searchTerm={searchTerm} />
				)}
			</TableContainer>
		</>
	);
};

const StyledTabButton = styled(TabButton)`
	min-width: 65px;
	height: 35px;
	margin-right: 5px;
`;

const TabButtonContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
`;

const SearchContainer = styled.div`
	display: flex;
	margin-top: 16px;
	height: 35px;
`;

const TableContainer = styled.div<{ compact: boolean | undefined }>`
	margin-top: 6px;
	margin-bottom: ${({ compact }) => (compact ? '0' : '40px')};
`;

export default Leaderboard;

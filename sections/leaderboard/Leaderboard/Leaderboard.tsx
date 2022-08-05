import Wei from '@synthetixio/wei';
import { useRouter } from 'next/router';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Search from 'components/Table/Search';
import ROUTES from 'constants/routes';

import AllTimeLeaderboard from '../AllTimeLeaderboard';
import { Tier } from '../common';
import Competition from '../Competition';
import TraderHistory from '../TraderHistory';

type LeaderboardProps = {
	compact?: boolean;
};

const Leaderboard: FC<LeaderboardProps> = ({ compact }: LeaderboardProps) => {
	const { t } = useTranslation();
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
					<AllTimeLeaderboard
						compact={compact}
						onClickTrader={onClickTrader}
						searchTerm={searchTerm}
					/>
				)}
			</TableContainer>
		</>
	);
};

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

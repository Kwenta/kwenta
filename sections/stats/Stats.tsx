import { FC } from 'react';

import { StatsContext } from 'contexts/StatsContext';
import useStatsData from 'hooks/useStatsData';

import { OpenInterest } from './charts/OpenInterest';
import { Traders } from './charts/Traders';
import { Trades } from './charts/Trades';
import { Volume } from './charts/Volume';
import { StatsContainer } from './stats.styles';

export const Stats: FC = () => {
	const statsData = useStatsData();

	return (
		<StatsContext.Provider value={statsData}>
			<StatsContainer>
				<Volume />
				<Trades />
				<Traders />
				<OpenInterest />
			</StatsContainer>
		</StatsContext.Provider>
	);
};

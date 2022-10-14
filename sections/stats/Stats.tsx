import { FC } from 'react';

import { StatsContext } from 'contexts/StatsContext';
import useStatsData from 'hooks/useStatsData';

import { OpenInterest } from './OpenInterest';
import { StatsContainer } from './stats.styles';
import { Traders } from './Traders';
import { Trades } from './Trades';
import { Volume } from './Volume';

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

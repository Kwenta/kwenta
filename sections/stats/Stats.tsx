import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { OpenInterest } from './OpenInterest';
import { StatsTitle, StatsContainer } from './stats.styles';
import { Traders } from './Traders';
import { Trades } from './Trades';
import { Volume } from './Volume';

export type StatsProps = {};

export const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	return (
		<StatsContainer>
			<Volume />
			<Trades />
			<Traders />
			<OpenInterest />
		</StatsContainer>
	);
};

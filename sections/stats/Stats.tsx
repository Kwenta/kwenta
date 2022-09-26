import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { OpenInterest } from './OpenInterest';
import { Container, StatsTitle, ChartContainer, TradeContainer } from './stats.styles';
import { Traders } from './Traders';
import { Trades } from './Trades';
import { Volume } from './Volume';

export type StatsProps = {};

export const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<StatsTitle>{t('stats.title')}</StatsTitle>
			<ChartContainer>
				<Volume />
				<TradeContainer>
					<Trades />
					<Traders />
				</TradeContainer>
				<OpenInterest />
			</ChartContainer>
		</Container>
	);
};

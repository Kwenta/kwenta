import { FC } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { PageContent, MainContent, FullHeightContainer } from 'styles/common';
import Leaderboard from 'sections/leaderboard/Leaderboard';

const Futures: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('futures.page-title')}</title>
			</Head>
			<PageContent>
				<FullHeightContainer>
					<MainContent>
						<Leaderboard />
					</MainContent>
				</FullHeightContainer>
			</PageContent>
		</>
	);
};

export default Futures;

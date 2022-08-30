import dynamic from 'next/dynamic';
import Head from 'next/head';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Earning from 'sections/homepage/Earning';
import Features from 'sections/homepage/Features';
import Hero from 'sections/homepage/Hero';
import ShortList from 'sections/homepage/ShortList';
import TradeNow from 'sections/homepage/TradeNow';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import HomeLayout from 'sections/shared/Layout/HomeLayout';
import type { TPages } from 'sections/shared/Layout/HomeLayout/Header';
import type { StatsProps } from 'sections/stats';
import media from 'styles/media';

const Stats = dynamic<StatsProps>(
	() => import('sections/stats').then((module) => module.Stats),
	{}
);

type AppLayoutProps = {
	children: React.ReactNode;
};

type HomePageComponent = FC & { layout?: FC<AppLayoutProps> };

const HomePage: HomePageComponent = () => {
	const { t } = useTranslation();

	const [currentPage, setCurrentPage] = useState<TPages>('landing-page');

	const Assets = dynamic(() => import('../sections/homepage/Assets'), {
		ssr: false,
	});

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout setCurrentPage={setCurrentPage}>
				{currentPage === 'landing-page' ? (
					<Container>
						<Hero />
						<Assets />
						<ShortList />
						<Earning />
						<Features />
						<TradeNow />
					  <GitHashID />
					</Container>
				) : (
					<Stats />
				)}
			</HomeLayout>
		</>
	);
};

export const Container = styled.div`
	width: 100%;
	margin: 0 auto;
	padding: 100px 20px 0 20px;
	${media.lessThan('sm')`
		padding: 50px 15px 0 15px;
	`}
`;

export default HomePage;

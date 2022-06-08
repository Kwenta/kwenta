import { FC } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Hero from 'sections/homepage/Hero';
import HomeLayout from 'sections/shared/Layout/HomeLayout';
import Features from 'sections/homepage/Features';
import ShortList from 'sections/homepage/ShortList';
import Earning from 'sections/homepage/Earning';
import Learn from 'sections/homepage/Learn';
import TradeNow from 'sections/homepage/TradeNow';
import media from 'styles/media';

type AppLayoutProps = {
	children: React.ReactNode;
};

type HomePageComponent = FC & { layout?: FC<AppLayoutProps> };

const HomePage: HomePageComponent = () => {
	const { t } = useTranslation();
	const Assets = dynamic(() => import('../sections/homepage/Assets'), {
		ssr: false,
	});

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout>
				<Container>
					<Hero />
					<Assets />
					<ShortList />
					<Earning />
					<Features />
					<Learn />
					<TradeNow />
				</Container>
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

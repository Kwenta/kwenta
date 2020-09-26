import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HomeLayout from 'sections/shared/Layout/HomeLayout';

import Hero from 'sections/homepage/Hero';
import Assets from 'sections/homepage/Assets';
import Features from 'sections/homepage/Features';
import Benefits from 'sections/homepage/Benefits';
import Steps from 'sections/homepage/Steps';
import FAQ from 'sections/homepage/FAQ';
import ChartBanner from 'sections/homepage/ChartBanner';

import { FlexDivCol, FlexDivColCentered } from 'styles/common';

const HomePage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout>
				<DarkContainer>
					<Hero />
					<Assets />
					<Features />
					<Benefits />
				</DarkContainer>
				<LightContainer>
					<Steps />
					<FAQ />
					<ChartBanner />
				</LightContainer>
			</HomeLayout>
		</>
	);
};

const DarkContainer = styled(FlexDivColCentered)`
	width: 100%;
	margin-top: 60px;
`;

const LightContainer = styled(FlexDivCol)`
	background: #0d0d18;
	width: 100%;
	padding: 55px 0px 24px 0px;
	margin-top: 60px;
`;

export default HomePage;

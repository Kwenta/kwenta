import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	GridDivCentered,
	FlexDiv,
	AbsoluteCenteredDiv,
	FlexDivRowCentered,
} from 'styles/common';
import LogoNoTextSVG from 'assets/inline-svg/brand/logo-no-text.svg';
import MarketOrderPreview from 'assets/inline-svg/marketing/market-order-preview.svg';
import AssetCollections from 'assets/inline-svg/marketing/asset-collections.svg';
import AssetDotPoint from 'assets/inline-svg/marketing/asset-card-dot.svg';
import FeatureCardDotPoint from 'assets/inline-svg/marketing/feature-card-dot.svg';
import SwapPreview from 'assets/inline-svg/marketing/swap-preview.svg';
import InfiniteLiquidity from 'assets/inline-svg/marketing/infinite-liquidity.svg';
import TradingPairs from 'assets/inline-svg/marketing/trading-pairs.svg';
import ZeroSlippage from 'assets/inline-svg/marketing/zero-slippage.svg';
import StepOne from 'assets/inline-svg/marketing/step-one.svg';
import StepTwo from 'assets/inline-svg/marketing/step-two.svg';
import StepThree from 'assets/inline-svg/marketing/step-three.svg';
import ChartBanner from 'assets/inline-svg/marketing/chart-banner.svg';

import HomeLayout from 'sections/shared/Layout/HomeLayout';
import React, { useState } from 'react';
import { TabButton, TabList, TabPanel } from 'components/Tab';
import Button from 'components/Button/Button';

import media from 'styles/media';

const HomePage = () => {
	const [activeTab, setActiveTab] = useState('0');

	const { t } = useTranslation();

	const assets = [
		{
			copy: t('homepage.assets.equities'),
		},
		{
			copy: t('homepage.assets.indicies'),
		},
		{
			copy: t('homepage.assets.stablecoins'),
		},
		{
			copy: t('homepage.assets.cryptocurrencies'),
		},
	];

	const returnAssetCards = () =>
		assets.map((e, i) => (
			<AssetCard key={i}>
				<AssetDotPoint />
				<AssetCardText>{e.copy}</AssetCardText>
			</AssetCard>
		));

	const features = [
		{
			title: t('homepage.features.order-types.title'),
			copy: t('homepage.features.order-types.copy'),
		},
		{
			title: t('homepage.features.options-futures.title'),
			copy: t('homepage.features.options-futures.copy'),
		},
		{
			title: t('homepage.features.leverage.title'),
			copy: t('homepage.features.leverage.copy'),
			comingSoon: true,
		},
		{
			title: t('homepage.features.options-futures.title'),
			copy: t('homepage.features.options-futures.copy'),
		},
	];

	const returnFeatureCards = () =>
		features.map((e, i) => (
			<FeatureCard key={i}>
				<FeatureCardDotPoint />
				<FlexDivCentered>
					<Title>{e.title}</Title>
					{e.comingSoon && <ComingSoonTag>COMING SOON</ComingSoonTag>}
				</FlexDivCentered>
				<Copy>{e.copy}</Copy>
			</FeatureCard>
		));

	const benefits = [
		{
			svg: <InfiniteLiquidity />,
			title: t('homepage.second-hero.infinite-liquidity.title'),
			copy: t('homepage.second-hero.infinite-liquidity.copy'),
		},
		{
			svg: <ZeroSlippage />,
			title: t('homepage.second-hero.zero-slippage.title'),
			copy: t('homepage.second-hero.zero-slippage.copy'),
		},
		{
			svg: <TradingPairs />,
			title: t('homepage.second-hero.trading-pairs.title'),
			copy: t('homepage.second-hero.trading-pairs.copy'),
		},
	];

	const returnBenefits = () =>
		benefits.map((e, i) => (
			<BenefitCard key={i}>
				{e.svg}
				<Title>{e.title}</Title>
				<Copy>{e.copy}</Copy>
			</BenefitCard>
		));

	const steps = [
		{
			svg: <StepOne />,
			subtitle: t('homepage.steps.one.subtitle'),
			title: t('homepage.steps.one.title'),
			copy: t('homepage.steps.one.copy'),
		},
		{
			svg: <StepTwo />,
			subtitle: t('homepage.steps.two.subtitle'),
			title: t('homepage.steps.two.title'),
			copy: t('homepage.steps.two.copy'),
		},
		{
			svg: <StepThree />,
			subtitle: t('homepage.steps.three.subtitle'),
			title: t('homepage.steps.three.title'),
			copy: t('homepage.steps.three.copy'),
		},
	];

	const returnSteps = () =>
		steps.map((e, i) => (
			<StepCard key={i}>
				<StepBox>
					<StepIcon>
						{e.svg}
						<StepSubtitle>{e.subtitle}</StepSubtitle>
					</StepIcon>
				</StepBox>
				<StepTitle>{e.title}</StepTitle>
				<StepCopy>{e.copy}</StepCopy>
			</StepCard>
		));

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<HomeLayout>
				<DarkContainer>
					<StackSection>
						<LogoNoTextSVG />
						<Header>{t('homepage.hero.title')}</Header>
						<MarketOrderPreview />
					</StackSection>

					<FlexSection>
						<AssetCollectionWrapper>
							<AssetCollections />
						</AssetCollectionWrapper>
						<Col>
							<LeftSubHeader>{t('homepage.assets.title')}</LeftSubHeader>
							<GridContainer>{returnAssetCards()}</GridContainer>
						</Col>
					</FlexSection>

					<FlexSection>
						<Col>
							<LeftSubHeader>{t('homepage.features.title')}</LeftSubHeader>
						</Col>
						<Col>
							<GridContainer>{returnFeatureCards()}</GridContainer>
						</Col>
					</FlexSection>

					<StackSection>
						<CenterSubHeader>{t('homepage.second-hero.title')}</CenterSubHeader>
						<SwapPreview />
						<BenefitContainer>{returnBenefits()}</BenefitContainer>
					</StackSection>
				</DarkContainer>

				<LightContainer>
					<FlexSection>
						<Col>
							<LeftSubHeader>{t('homepage.steps.title')}</LeftSubHeader>
						</Col>
						<StepList>{returnSteps()}</StepList>
					</FlexSection>

					<StackSection>
						<CenterSubHeader>{t('homepage.faq.title')}</CenterSubHeader>
						<TabList style={{ marginBottom: '12px' }}>
							<StyledTabButton
								name={t('homepage.faq.tabs.one')}
								active={activeTab === '0'}
								onClick={() => setActiveTab('0')}
							>
								{t('homepage.faq.tabs.one')}
							</StyledTabButton>
							<StyledTabButton
								name={t('homepage.faq.tabs.two')}
								active={activeTab === '1'}
								onClick={() => setActiveTab('1')}
							>
								{t('homepage.faq.tabs.two')}
							</StyledTabButton>
							<StyledTabButton
								name={t('homepage.faq.tabs.three')}
								active={activeTab === '2'}
								onClick={() => setActiveTab('2')}
							>
								{t('homepage.faq.tabs.three')}
							</StyledTabButton>
						</TabList>
						<TabPanel name={t('homepage.faq.tabs.one')} activeTab={'0'}>
							<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
						</TabPanel>
						<TabPanel name={t('homepage.faq.tabs.two')} activeTab={'1'}>
							<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
						</TabPanel>
						<TabPanel name={t('homepage.faq.tabs.three')} activeTab={'2'}>
							<FAQPanel>{t('common.features.coming-soon')}</FAQPanel>
						</TabPanel>
					</StackSection>
					<StackSection>
						<ChartGraphicContainer>
							<ChartBanner />
							<OverlayText>
								<Subtext>{t('homepage.footer.cta.title')}</Subtext>
								<CTAButton variant="primary">{t('homepage.footer.cta.button')}</CTAButton>
							</OverlayText>
						</ChartGraphicContainer>
					</StackSection>
				</LightContainer>
			</HomeLayout>
		</>
	);
};

const Header = styled.p`
	font-weight: 700;
	font-size: 48px;
	line-height: 120%;
	text-align: center;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.white};
`;

const SubHeader = styled.p`
	font-size: 64px;
	font-weight: 400;
	line-height: 120%;
	letter-spacing: 0.2px;
	width: 75%;
	color: ${(props) => props.theme.colors.white};
`;

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

const LeftSubHeader = styled(SubHeader)`
	text-align: left;
`;

const CenterSubHeader = styled(SubHeader)`
	text-align: center;
`;

const FlexSection = styled(FlexDiv)`
	width: 100%;
	margin: 24px 0px;
	${media.lessThan('lg')`
		flex-direction: column;
	`}
`;

const StackSection = styled(FlexDivColCentered)`
	width: 100%;
	margin: 24px 0px;
`;

const AssetCollectionWrapper = styled.div`
	width: 50%;
	margin-left: -20px;
`;

const Col = styled(FlexDivCol)`
	width: 50%;
	margin: 64px;
`;

const AssetCard = styled(FlexDivCentered)`
	background: #0d0d18;
	border: ${(props) => `1px solid ${props.theme.colors.black}`};
	box-sizing: border-box;
	border-radius: 3px;
	padding: 16px;
`;

const AssetCardText = styled.p`
	font-weight: 800;
	font-size: 16px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	margin: 0px 0px 0px 16px;
	text-align: center;
`;

const GridContainer = styled(GridDivCentered)`
	grid-template-columns: repeat(2, 350px);
	grid-gap: 24px;
`;

const FeatureCard = styled(FlexDivCol)`
	margin-bottom: 16px;
`;

const Title = styled.p`
	font-size: 16px;
	font-weight: 700;
	line-height: 64px;
	text-align: left;
	color: ${(props) => props.theme.colors.white};
`;

const Copy = styled.p`
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: 24px;
	letter-spacing: -0.005em;
	text-align: left;
	color: #92969f;
`;

const BenefitCard = styled(FlexDivCol)`
	align-items: flex-start;
	width: 33%;
	margin: 24px 16px;
`;

const BenefitContainer = styled(FlexDivRowCentered)`
	margin: 64px 0px;
	justify-content: center;
`;

const StepBox = styled.div`
	position: relative;
`;

const StepList = styled(FlexDivColCentered)`
	width: 50%;
`;

const StepCard = styled(FlexDivCol)`
	width: 400px;
	margin: 24px 0px;
`;

const StepIcon = styled.div`
	position: relative;
`;

const StepSubtitle = styled.p`
	font-size: 16px;
	background: linear-gradient(180deg, #f2de82 0%, #d1a866 100%);
	background-clip: text;
	background-size: 100%;
	background-repeat: repeat;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-moz-background-clip: text;
	-moz-text-fill-color: transparent;
	position: absolute;
	bottom: 0;
	margin-bottom: 5px;
`;

const StepTitle = styled.p`
	font-weight: 500;
	font-size: 34px;
	line-height: 41px;
	letter-spacing: -0.03em;
	color: #f7f8fa;
`;

const StepCopy = styled.p`
	font-size: 16px;
	line-height: 24px;
	letter-spacing: -0.005em;
	color: #92969f;
`;

const FAQPanel = styled.div``;

const StyledTabButton = styled(TabButton)`
	background: linear-gradient(180deg, #f2de82 0%, #d1a866 100%);
	background-clip: text;
	background-size: 100%;
	background-repeat: repeat;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-moz-background-clip: text;
	-moz-text-fill-color: transparent;
	padding-bottom: 8px;
	margin: 0px 24px;
	border-bottom: ${(props) => (props.active ? `2px solid #f2de82` : 'none')};
`;

const ChartGraphicContainer = styled(FlexDivCentered)`
	position: relative;
	width: 100%;
	justify-content: center;
	margin-bottom: -240px;
`;

const OverlayText = styled(AbsoluteCenteredDiv)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const CTAButton = styled(Button)`
	color: ${(props) => props.theme.colors.black};
	background: ${(props) => props.theme.colors.white};
	width: 50%;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 128px;
	height: 24px;
	background: ${(props) => props.theme.colors.purple};
	border-radius: 50px;
	color: ${(props) => props.theme.colors.white};
	font-weight: bold;
	justify-content: center;
	margin-left: 8px;
`;

const Subtext = styled.p`
	font-weight: bold;
	font-size: 32px;
	line-height: 120%;
	text-align: center;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.white};
`;

export default HomePage;

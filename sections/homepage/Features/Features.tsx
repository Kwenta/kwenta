import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import SlippageIcon from 'assets/svg/marketing/icon-slippage.svg';
import InfiniteLiquidityIcon from 'assets/svg/marketing/icon-infinite-liquidity.svg';
import FuturesIcon from 'assets/svg/marketing/icon-futures.svg';

import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';

import { Copy, GridContainer, Title } from '../common';

const FEATURES = [
	{
		key: 'blazing-fast',
		title: 'homepage.features.blazing-fast.title',
		copy: 'homepage.features.blazing-fast.copy',
		image: <InfiniteLiquidityIcon />,
	},
	{
		key: 'low-gas-fees',
		title: 'homepage.features.low-gas-fees.title',
		copy: 'homepage.features.low-gas-fees.copy',
		image: <SlippageIcon />,
	},
	{
		key: 'unique-assets',
		title: 'homepage.features.unique-assets.title',
		copy: 'homepage.features.unique-assets.copy',
		image: <FuturesIcon />,
	},
	{
		key: 'permissionless',
		title: 'homepage.features.permissionless.title',
		copy: 'homepage.features.permissionless.copy',
		image: <FuturesIcon />,
	},
	{
		key: 'mobile',
		title: 'homepage.features.mobile.title',
		copy: 'homepage.features.mobile.copy',
		image: <FuturesIcon />,
		comingSoon: true,
	},
	{
		key: 'easy-ramping',
		title: 'homepage.features.easy-ramping.title',
		copy: 'homepage.features.easy-ramping.copy',
		image: <FuturesIcon />,
		comingSoon: true,
	},
	{
		key: 'zero-slippage',
		title: 'homepage.features.zero-slippage.title',
		copy: 'homepage.features.zero-slippage.copy',
		image: <SlippageIcon />,
	},
];

const PARTNERS = [
	{
		key: 'synthetix',
		image: <InfiniteLiquidityIcon />,
	},
	{
		key: 'lyra',
		image: <SlippageIcon />,
	},
	{
		key: 'aelin',
		image: <FuturesIcon />,
	},
	{
		key: 'thales',
		image: <FuturesIcon />,
	},
	{
		key: 'defi-captial',
		image: <FuturesIcon />,
	},
	{
		key: 'optimism',
		image: <FuturesIcon />,
	},
	{
		key: 'synthman',
		image: <SlippageIcon />,
	},
	{
		key: 'polychian',
		image: <SlippageIcon />,
	},
	{
		key: 'synthetix',
		image: <InfiniteLiquidityIcon />,
	},
	{
		key: 'lyra',
		image: <SlippageIcon />,
	},
	{
		key: 'aelin',
		image: <FuturesIcon />,
	},
	{
		key: 'thales',
		image: <FuturesIcon />,
	},
	{
		key: 'defi-captial',
		image: <FuturesIcon />,
	},
	{
		key: 'optimism',
		image: <FuturesIcon />,
	},
	{
		key: 'synthman',
		image: <SlippageIcon />,
	},
	{
		key: 'polychian',
		image: <SlippageIcon />,
	},
];

const Features = () => {
	const { t } = useTranslation();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.features.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.features.description')}</WhiteHeader>
		</>
	);

	const sectionTitle = (
		<>
			<SectionFeatureTitle>{t('homepage.features.partners.title')}</SectionFeatureTitle>
			<SectionFeatureCopy>{t('homepage.features.partners.copy')}</SectionFeatureCopy>
		</>
	);

	return (
		<Container>
			<FlexDivColCentered>{title}</FlexDivColCentered>
			<StyledGridContainer>
				{FEATURES.map(({ key, title, comingSoon, copy, image }) => (
					<FeatureCard key={key}>
						<FeatureIconContainer>{image}</FeatureIconContainer>
						<FeatureContentContainer>
							<FeatureContentTitle>
								<FeatureTitle>{t(title)}</FeatureTitle>
								{comingSoon && <ComingSoonTag>{t('common.features.coming-soon')}</ComingSoonTag>}
							</FeatureContentTitle>
							<FeatureCopy>{t(copy)}</FeatureCopy>
						</FeatureContentContainer>
					</FeatureCard>
				))}
			</StyledGridContainer>
			<FlexDivColCentered>{sectionTitle}</FlexDivColCentered>
			<IconGridContainer>
				{PARTNERS.map(({ key, image }) => (
					<FeatureIconContainer key={key}>{image}</FeatureIconContainer>
				))}
			</IconGridContainer>
		</Container>
	);
};

const FeatureCopy = styled(Copy)`
	font-size: 15px;
	line-height: 150%;
	letter-spacing: -0.03em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	width: 183px;
`;

const FeatureTitle = styled(Title)`
	font-size: 24px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	width: 150px;
`;

const StyledGridContainer = styled(GridContainer)`
	grid-template-columns: repeat(2, auto);
	grid-gap: 20px 20px;
	margin-top: 60px;
`;

const IconGridContainer = styled(GridContainer)`
	grid-template-columns: repeat(4, auto);
	grid-gap: 20px 200px;
	margin-top: 60px;
`;

const Container = styled.div`
	margin-bottom: 150px;
`;

const FeatureCard = styled(FlexDivRow)`
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 32px 80px 32px 32px;
	width: 373px;
	height: 120px;
`;

const FeatureIconContainer = styled.div`
	padding-bottom: 40px;
	svg {
		width: 64px;
		height: 64px;
	}
`;

const FeatureContentContainer = styled(FlexDivCol)`
	margin-left: 20px;
`;

const FeatureContentTitle = styled(FlexDivRow)`
	padding-bottom: 12px;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 50px;
	height: 24px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin-left: 16px;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 8px;
`;

const SectionFeatureTitle = styled(FeatureTitle)`
	margin-top: 80px;
	text-align: center;
	width: 500px;
`;

const SectionFeatureCopy = styled(FeatureCopy)`
	margin-top: 16px;
	text-align: center;
	width: 500px;
	font-size: 18px;
`;

export default Features;

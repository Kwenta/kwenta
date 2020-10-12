import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LogoNoTextSVG from 'assets/inline-svg/brand/logo-no-text.svg';
import MarketOrderPreview from 'assets/png/marketing/market-order-preview.png';

import { GridDiv, Paragraph } from 'styles/common';
import { StackSection } from '../common';

import media from 'styles/media';

const Hero = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<LogoNoTextSVG />
			<Header>{t('homepage.hero.title')}</Header>
			<HeroImageContainer>
				<HeroImage src={MarketOrderPreview} alt="" />
			</HeroImageContainer>
		</StackSection>
	);
};

const Header = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 48px;
	line-height: 120%;
	text-align: center;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.white};
	padding-top: 40px;
`;

const HeroImageContainer = styled(GridDiv)`
	width: 100vw;
	overflow: hidden;
	display: grid;
	justify-content: center;
	margin-top: -40px;
	${media.lessThan('sm')`
		margin-top: 0;
	`}
`;

const HeroImage = styled.img`
	max-width: 1400px;
	${media.lessThan('md')`
		width: 1140px;
	`}
	${media.lessThan('sm')`
		width: 560px;
	`}
`;

export default Hero;

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LogoNoTextSVG from 'assets/inline-svg/brand/logo-no-text.svg';
import MarketOrderPreview from 'assets/svg/marketing/market-order-preview.svg';

import { Paragraph } from 'styles/common';
import { StackSection, StyledResponsiveImage } from '../common';

const Hero = () => {
	const { t } = useTranslation();

	return (
		<StyledStackSection>
			<LogoNoTextSVG />
			<Header>{t('homepage.hero.title')}</Header>
			<StyledResponsiveImage src={MarketOrderPreview} alt="" />
		</StyledStackSection>
	);
};

const StyledStackSection = styled(StackSection)`
	padding-bottom: 50px;
`;

const Header = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 48px;
	line-height: 120%;
	text-align: center;
	letter-spacing: 0.2px;
	color: ${(props) => props.theme.colors.white};
	padding-top: 40px;
`;

export default Hero;

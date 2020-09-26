import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LogoNoTextSVG from 'assets/inline-svg/brand/logo-no-text.svg';
import MarketOrderPreview from 'assets/svg/marketing/market-order-preview.svg';

import { StackSection } from '../common';

const Hero = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<LogoNoTextSVG />
			<Header>{t('homepage.hero.title')}</Header>
			<img src={MarketOrderPreview} alt="" />
		</StackSection>
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

export default Hero;

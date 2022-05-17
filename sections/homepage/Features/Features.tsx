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
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';

import { Copy, FlexSection, GridContainer, LeftSubHeader, Title } from '../common';
import media, { Media } from 'styles/media';

const FEATURES = [
	{
		id: 'infinite-liquidity',
		title: 'homepage.features.infinite-liquidity.title',
		copy: 'homepage.features.infinite-liquidity.copy',
		image: <InfiniteLiquidityIcon />,
	},
	{
		id: 'zero-slippage',
		title: 'homepage.features.zero-slippage.title',
		copy: 'homepage.features.zero-slippage.copy',
		image: <SlippageIcon />,
	},
	{
		id: 'synthetic-futures',
		title: 'homepage.features.synthetic-futures.title',
		copy: 'homepage.features.synthetic-futures.copy',
		image: <FuturesIcon />,
		comingSoon: true,
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

	return (
		<Container>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>{title}</FlexDivColCentered>
			</Media>
			<Media lessThan="lg">{title}</Media>
		</Container>
	);
};

const StyledGridContainer = styled(GridContainer)`
	${media.lessThan('lg')`
		grid-template-columns: repeat(3, auto);
	`}
	${media.lessThan('md')`
		grid-template-columns: auto;
	`}
`;

const Container = styled.div`
	margin-bottom: 150px;
	${media.lessThan('lg')`
		margin-bottom: 75px;
	`}
`;

const StyledLeftSubHeader = styled(LeftSubHeader)`
	max-width: 500px;
	padding-top: 80px;
	${media.lessThan('lg')`
		padding-top: 0;
		padding-bottom: 56px;
	`}
`;

const FeatureCard = styled(FlexDivCol)`
	margin-bottom: 16px;
`;

const FeatureIconContainer = styled.div`
	padding-bottom: 40px;
	img {
		width: 64px;
		height: 64px;
	}
`;

const FeatureContentTitle = styled(FlexDivCentered)`
	padding-bottom: 14px;
`;

const ComingSoonTag = styled(FlexDivCentered)`
	width: 104px;
	height: 24px;
	background: ${(props) => props.theme.colors.gold};
	border-radius: 50px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	justify-content: center;
	margin-left: 16px;
`;

export default Features;

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Img from 'react-optimized-image';

import SlippageIcon from 'assets/svg/marketing/icon-slippage.svg';
import InfiniteLiquidityIcon from 'assets/svg/marketing/icon-infinite-liquidity.svg';
import FuturesIcon from 'assets/svg/marketing/icon-futures.svg';

import { FlexDivCentered, FlexDivCol } from 'styles/common';

import { Copy, FlexSection, GridContainer, LeftSubHeader, Title } from '../common';
import media from 'styles/media';

const FEATURES = [
	{
		id: 'infinite-liquidity',
		title: 'homepage.features.infinite-liquidity.title',
		copy: 'homepage.features.infinite-liquidity.copy',
		image: <Img src={InfiniteLiquidityIcon} alt="" />,
	},
	{
		id: 'zero-slippage',
		title: 'homepage.features.zero-slippage.title',
		copy: 'homepage.features.zero-slippage.copy',
		image: <Img src={SlippageIcon} alt="" />,
	},
	{
		id: 'synthetic-futures',
		title: 'homepage.features.synthetic-futures.title',
		copy: 'homepage.features.synthetic-futures.copy',
		image: <Img src={FuturesIcon} alt="" />,
		comingSoon: true,
	},
];

const Features = () => {
	const { t } = useTranslation();

	return (
		<Container>
			<FlexSection>
				<StyledLeftSubHeader>{t('homepage.features.title')}</StyledLeftSubHeader>
				<StyledGridContainer>
					{FEATURES.map(({ id, title, comingSoon, copy, image }) => (
						<FeatureCard key={id}>
							<FeatureIconContainer>{image}</FeatureIconContainer>
							<FeatureContentTitle>
								<Title>{t(title)}</Title>
								{comingSoon && <ComingSoonTag>{t('common.features.coming-soon')}</ComingSoonTag>}
							</FeatureContentTitle>
							<Copy>{t(copy)}</Copy>
						</FeatureCard>
					))}
				</StyledGridContainer>
			</FlexSection>
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
	padding-bottom: 240px;
	${media.lessThan('lg')`
		padding-bottom: 140px;
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

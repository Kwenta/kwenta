import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import SlippageIcon from 'assets/svg/marketing/icon-slippage.svg';
import InfiniteLiquidityIcon from 'assets/svg/marketing/icon-infinite-liquidity.svg';
import FuturesIcon from 'assets/svg/marketing/icon-futures.svg';
import { Copy, Title } from '../common';

const LEARNS = [
	{
		key: 'how-to-trade',
		title: 'homepage.learn.how-to-trade.title',
		copy: 'homepage.learn.how-to-trade.copy',
		image: <InfiniteLiquidityIcon />,
	},
	{
		key: 'how-to-stake',
		title: 'homepage.learn.how-to-stake.title',
		copy: 'homepage.learn.how-to-stake.copy',
		image: <SlippageIcon />,
	},
	{
		key: 'how-governance',
		title: 'homepage.learn.how-governance.title',
		copy: 'homepage.learn.how-governance.copy',
		image: <FuturesIcon />,
	},
	{
		key: 'faq',
		title: 'homepage.learn.faq',
		copy: '',
		image: <FuturesIcon />,
	},
];

const Learn = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.learn.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.learn.description')}</WhiteHeader>
		</>
	);

	return (
		<Container ref={whyKwentaRef}>
			<FlexDivColCentered>{title}</FlexDivColCentered>
			<StyledFlexDivRow>
				{LEARNS.map(({ key, title, copy, image }) => (
					<FeatureCard key={key} className={key}>
						<FeatureIconContainer>{image}</FeatureIconContainer>
						<FeatureContentContainer>
							<FeatureContentTitle>
								<FeatureTitle>{t(title)}</FeatureTitle>
							</FeatureContentTitle>
							<FeatureCopy>{t(copy)}</FeatureCopy>
						</FeatureContentContainer>
					</FeatureCard>
				))}
			</StyledFlexDivRow>
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

const StyledFlexDivRow = styled(FlexDivRow)`
	margin: auto;
	margin-top: 60px;
	gap: 20px 20px;
	width: 766px;
	flex-wrap: wrap;
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
	height: 380px;

	&.how-to-stake {
		width: 373px;
	}

	&.how-governance {
		width: 373px;
		grid-area: row2-start / col2-start / third-line / 3;
	}

	&.how-to-trade {
		width: 766px;
		height: 280px;
	}

	&.faq {
		width: 766px;
		height: 100px;
	}
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

export default Learn;

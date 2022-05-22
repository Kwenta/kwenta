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
import Link from 'next/link';
import ROUTES from 'constants/routes';
import Button from 'components/Button';

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
						<FeatureIconContainer className={key}>{image}</FeatureIconContainer>
						<FeatureContentContainer>
							{/* <FeatureContentTitle > */}
							<FeatureTitle className={key}>{t(title)}</FeatureTitle>
							{/* </FeatureContentTitle> */}
							<FeatureCopy>{t(copy)}</FeatureCopy>
							<Link href={ROUTES.Home.Overview}>
								{key !== 'faq' ? (
									<StyledButton variant="primary" isRounded={false} size="sm">
										{t('homepage.learn.title')}
									</StyledButton>
								) : (
									<></>
								)}
							</Link>
						</FeatureContentContainer>
					</FeatureCard>
				))}
			</StyledFlexDivRow>
		</Container>
	);
};

const StyledButton = styled(Button)`
	width: 148px;
	height: 40px;
	background: linear-gradient(180deg, #282727 0%, #191818 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 12px;
`;

const FeatureCopy = styled(Copy)`
	font-size: 15px;
	line-height: 150%;
	letter-spacing: -0.03em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	margin-bottom: 46px;
`;

const FeatureTitle = styled(Title)`
	font-size: 24px;
	line-height: 100%;
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.white};
	text-shadow: 0px 0px 12.83px rgba(255, 255, 255, 0.2);
	width: 203px;
	padding-bottom: 20px;

	&.how-to-stake,
	&.how-governance {
		width: 252px;
	}

	&.how-to-trade {
		margin-top: 0px;
		width: 203px;
	}

	&.faq {
		padding-bottom: 0px;
		margin: 5px;
		margin-left: 0px;
	}
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

	&.how-to-stake,
	&.how-governance {
		width: 373px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	&.how-to-trade {
		width: 766px;
		height: 280px;
		display: flex;
		flex-direction: row-reverse;
	}

	&.faq {
		width: 766px;
		height: 100px;
		flex-direction: row-reverse;
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
	margin-left: 10px;
	width: 313px;
`;

export default Learn;

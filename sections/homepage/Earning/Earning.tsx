import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import { Copy, GridContainer, Title } from '../common';

import SlippageIcon from 'assets/svg/marketing/icon-slippage.svg';
import InfiniteLiquidityIcon from 'assets/svg/marketing/icon-infinite-liquidity.svg';
import FuturesIcon from 'assets/svg/marketing/icon-futures.svg';
import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right.svg';

import Link from 'next/link';
import ROUTES from 'constants/routes';
import Button from 'components/Button';

const EARNINGS = [
	{
		id: 'stake-to-earn',
		title: 'homepage.earning.stake-to-earn.title',
		copy: 'homepage.earning.stake-to-earn.copy',
		image: <InfiniteLiquidityIcon />,
	},
	{
		id: 'trade-to-earn',
		title: 'homepage.earning.trade-to-earn.title',
		copy: 'homepage.earning.trade-to-earn.copy',
		image: <SlippageIcon />,
	},
	{
		id: 'vote-and-govern',
		title: 'homepage.earning.vote-and-govern.title',
		copy: 'homepage.earning.vote-and-govern.copy',
		image: <FuturesIcon />,
	},
];

const Earning = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.earning.title')}</SmallGoldenHeader>
			<WhiteHeader>
				<Trans i18nKey={'homepage.earning.description'} components={[<Emphasis />]} />
			</WhiteHeader>
		</>
	);

	return (
		<Container ref={whyKwentaRef}>
			<FlexDivColCentered>{title}</FlexDivColCentered>
			<StyledGridContainer>
				{EARNINGS.map(({ id, title, copy, image }) => (
					<FeatureCard key={id}>
						<FeatureIconContainer>{image}</FeatureIconContainer>
						<FeatureContentTitle>
							<CenteredTitle>{t(title)}</CenteredTitle>
						</FeatureContentTitle>
						<CenteredCopy>{t(copy)}</CenteredCopy>
					</FeatureCard>
				))}
			</StyledGridContainer>
			<StatsCardContainer>
				<StatsCard>
					<StatsValue>120%</StatsValue>
					<StatsName>Trading Volume</StatsName>
				</StatsCard>
				<StatsCard className="mid">
					<StatsValue>+20%</StatsValue>
					<StatsName>Liquidity</StatsName>
				</StatsCard>
				<StatsCard>
					<StatsValue>$1,322,220.92</StatsValue>
					<StatsName>Total Daily Trades</StatsName>
				</StatsCard>
			</StatsCardContainer>
			<CTAContainer>
				<Link href={ROUTES.Home.Overview}>
					<Button variant="primary" isRounded={false} size="md">
						{t('homepage.earning.stake-kwenta')}
					</Button>
				</Link>
				<Link href={ROUTES.Home.Overview}>
					<StyledButton isRounded={false} size="md">
						{t('homepage.earning.how-to-earn')}
						<ArrowUpRightIcon />
					</StyledButton>
				</Link>
			</CTAContainer>
		</Container>
	);
};

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryGold};
`;

const StyledButton = styled(Button)`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StatsName = styled.div`
	font-size: 15px;
	letter-spacing: -0.02em;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;
const StatsValue = styled.div`
	font-size: 40px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-top: 14px;
	margin-bottom: 10px;
`;
const StatsCardContainer = styled(FlexDivRow)`
	margin-top: 80px;
	justify-content: center;
	column-gap: 150px;
	border-top: 1px solid #3d3c3c;
`;

const StatsCard = styled(FlexDivColCentered)`
	width: 308px;
	height: 191px;
	padding: 45px;
`;
const CenteredCopy = styled(Copy)`
	font-size: 15px;
	text-align: center;
	line-height: 150%;
	letter-spacing: -0.03em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const CenteredTitle = styled(Title)`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	text-transform: uppercase;
	font-size: 24px;
`;

const Container = styled.div`
	padding-top: 80px;
	padding-bottom: 150px;
`;

const StyledGridContainer = styled(GridContainer)`
	grid-template-columns: repeat(3, auto);
	grid-column-gap: 125px;
`;

const FeatureCard = styled(FlexDivCol)`
	margin-top: 90px;
`;

const FeatureIconContainer = styled.div`
	padding-bottom: 25px;
	svg {
		width: 64px;
		height: 64px;
	}
	display: flex;
	justify-content: center;
`;

const FeatureContentTitle = styled(FlexDivCentered)`
	padding-bottom: 20px;
	justify-content: center;
`;

const CTAContainer = styled.div`
	margin: 50px 0px 0px 0;
	z-index: 1;
	display: flex;
	justify-content: center;
	gap: 20px;
`;

export default Earning;

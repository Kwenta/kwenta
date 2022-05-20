import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StatsSvg from 'assets/svg/futures/stats.svg';
import CurrencyIcon from 'assets/svg/futures/currency-icon.svg';

import { FlexDivColCentered, FlexDivRow, SmallGoldenHeader, WhiteHeader } from 'styles/common';

import media, { Media } from 'styles/media';
import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import { GridContainer } from '../common';

const Assets = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.assets.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.assets.description')}</WhiteHeader>
		</>
	);

	const ASSETS = [
		{
			key: 'sBTC',
			name: 'Bitcoin',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$46,401.91',
			chg: '+1.55%',
			vol: '$73.1M',
		},
		{
			key: 'sETH',
			name: 'Ethereum',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$3,340.20',
			chg: '-2.65%',
			vol: '$53.1M',
		},
		{
			key: 'sBTC',
			name: 'Bitcoin',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$46,401.91',
			chg: '+1.55%',
			vol: '$73.1M',
		},
		{
			key: 'sETH',
			name: 'Ethereum',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$3,340.20',
			chg: '-2.65%',
			vol: '$53.1M',
		},
		{
			key: 'sBTC',
			name: 'Bitcoin',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$46,401.91',
			chg: '+1.55%',
			vol: '$73.1M',
		},
		{
			key: 'sETH',
			name: 'Ethereum',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$3,340.20',
			chg: '-2.65%',
			vol: '$53.1M',
		},
		{
			key: 'sBTC',
			name: 'Bitcoin',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$46,401.91',
			chg: '+1.55%',
			vol: '$73.1M',
		},
		{
			key: 'sETH',
			name: 'Ethereum',
			icon: <CurrencyIcon />,
			image: <StatsSvg />,
			price: '$3,340.20',
			chg: '-2.65%',
			vol: '$53.1M',
		},
	];

	return (
		<Container ref={whyKwentaRef}>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>
					{title}
					<StatsCardContainer>
						{ASSETS.map(({ key, name, icon, image, price, chg, vol }) => (
							<StatsCard>
								<AssetNameContainer>
									{icon}
									<StatsNameContainer>
										<AssetName>{key}</AssetName>
										<AssetDescription>{name}</AssetDescription>
									</StatsNameContainer>
								</AssetNameContainer>
								<ChartContainer>{image}</ChartContainer>
								<AssetPrice>{price}</AssetPrice>
								<StatsValueContainer>
									<StatsValue>CHG: {chg}</StatsValue>
									<StatsValue>VOL: {vol}</StatsValue>
								</StatsValueContainer>
							</StatsCard>
						))}
					</StatsCardContainer>
				</FlexDivColCentered>
			</Media>
		</Container>
	);
};

const ChartContainer = styled.span`
	display: flex;
	align-items: center;
	height: 32px;
	width: 80px;
`;

const AssetNameContainer = styled(FlexDivRow)``;

const StatsValueContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 80px;
	font-size: 15px;
`;

const StatsNameContainer = styled.div`
	font-size: 18px;
	margin-left: 10px;
`;

const AssetName = styled.div`
	font-size: 18px;
`;

const AssetPrice = styled.div`
	font-size: 20px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const AssetDescription = styled.div`
	font-size: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StatsValue = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	letter-spacing: -0.04em;
`;
const StatsCardContainer = styled(GridContainer)`
	margin-top: 40px;
	grid-template-columns: repeat(4, auto);
`;

const StatsCard = styled(GridContainer)`
	grid-template-columns: repeat(2, auto);
	width: 275px;
	height: 140px;
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 20px;
`;

const Container = styled.div`
	padding-top: 80px;
	${media.lessThan('md')`
		padding-top: 40px;
	`}
	padding-bottom: 150px;
`;

export const Bullet = styled.span`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background: ${(props) => props.theme.colors.gold};
`;

export default Assets;

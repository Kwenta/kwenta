import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StakeToEarnIcon from 'assets/svg/earn/stake-to-earn.svg';
import TradeToEarnIcon from 'assets/svg/earn/trade-to-earn.svg';
import VoteNGovernIcon from 'assets/svg/earn/vote-n-govern.svg';
import Loader from 'components/Loader';
import { Synths } from 'constants/currency';
import useGetFuturesCumulativeStats from 'queries/futures/useGetFuturesCumulativeStats';
import {
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	GridDiv,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import media, { Media } from 'styles/media';
import { formatCurrency, formatNumber, zeroBN } from 'utils/formatters/number';

import { Copy, StackSection, Title } from '../common';

const EARNINGS = [
	{
		id: 'vote-and-govern',
		title: 'homepage.earning.vote-and-govern.title',
		copy: 'homepage.earning.vote-and-govern.copy',
		image: <VoteNGovernIcon />,
	},
	{
		id: 'stake-to-earn',
		title: 'homepage.earning.stake-and-earn.title',
		copy: 'homepage.earning.stake-and-earn.copy',
		image: <StakeToEarnIcon />,
	},
	{
		id: 'trade-to-earn',
		title: 'homepage.earning.trade-and-earn.title',
		copy: 'homepage.earning.trade-and-earn.copy',
		image: <TradeToEarnIcon />,
	},
];

const Earning = () => {
	const { t } = useTranslation();

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.earning.title')}</SmallGoldenHeader>
			<WhiteHeader>
				<Trans i18nKey={'homepage.earning.description'} components={[<Emphasis />]} />
			</WhiteHeader>
			<GrayCopy>{t('homepage.earning.copy')}</GrayCopy>
		</>
	);

	const totalTradeStats = useGetFuturesCumulativeStats();
	return (
		<StackSection>
			<Container>
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<Media greaterThan="sm">
					<StyledFlexContainer>
						{EARNINGS.map(({ id, title, copy, image }) => (
							<FeatureCard key={id}>
								<FeatureIconContainer>{image}</FeatureIconContainer>
								<FeatureContentTitle>
									<CenteredTitle>{t(title)}</CenteredTitle>
								</FeatureContentTitle>
								<CenteredCopy>{t(copy)}</CenteredCopy>
							</FeatureCard>
						))}
					</StyledFlexContainer>
				</Media>
				<Media lessThan="sm">
					<StyledFlexDivColCentered>
						{EARNINGS.map(({ id, title, copy, image }) => (
							<FeatureCard key={id}>
								<FeatureIconContainer>{image}</FeatureIconContainer>
								<FeatureContentTitle>
									<CenteredTitle>{t(title)}</CenteredTitle>
								</FeatureContentTitle>
								<CenteredCopy>{t(copy)}</CenteredCopy>
							</FeatureCard>
						))}
					</StyledFlexDivColCentered>
				</Media>
				<StatsCardContainer>
					<StatsCard className="first">
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatCurrency(Synths.sUSD, totalTradeStats.data?.totalVolume || zeroBN, {
									sign: '$',
									minDecimals: 0,
								})
							)}
						</StatsValue>
						<StatsName>{t('homepage.earning.stats.volume')}</StatsName>
					</StatsCard>
					<StatsCard>
						<StatsValue>
							{totalTradeStats.isLoading ? (
								<Loader />
							) : (
								formatNumber(totalTradeStats.data?.totalTrades ?? 0, { minDecimals: 0 })
							)}
						</StatsValue>
						<StatsName>{t('homepage.earning.stats.trades')}</StatsName>
					</StatsCard>
				</StatsCardContainer>
			</Container>
		</StackSection>
	);
};

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	width: 405px;
	margin: auto;
	padding: 0px;
`;

const GrayCopy = styled(Copy)`
	margin-top: 17px;
	text-align: center;
	width: 446px;
	font-size: 18px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	${media.lessThan('sm')`
		font-size: 16px;
		width: 336px;
		margin-bottom: 60px;
	`}
`;

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryGold};
`;

const StatsName = styled.div`
	font-size: 15px;
	letter-spacing: -0.02em;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	${media.lessThan('sm')`
		font-size: 11px;
	`}
`;

const StatsValue = styled.div`
	font-size: 40px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-top: 14px;
	margin-bottom: 10px;
	${media.lessThan('sm')`
		font-size: 24px;
	`}
`;

const StatsCardContainer = styled(FlexDivRow)`
	margin: 80px 0px;
	justify-content: center;
	border-top: 1px solid #3d3c3c;
	width: 1160px;
	${media.lessThan('sm')`
		width: 345px;
		margin: 60px auto;
		padding: 0px;
	`}
`;

const StatsCard = styled(FlexDivColCentered)`
	width: 580px;
	padding: 10px 45px;
	margin-top: 40px;

	&.first {
		border-right: 1px solid #3d3c3c;
	}
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

const Container = styled(GridDiv)`
	width: 100vw;
	${media.greaterThan('sm')`
		background: radial-gradient(white, rgba(2, 225, 255, 0.2) 0px, transparent 180px),
		radial-gradient(white, rgba(201, 151, 90, 0.25) 0px, transparent 280px),
		linear-gradient(180deg, #0f0f0f 0%, #1e1e1e 100%);
		background-size: 100% 200%, 100% 200%, 100% 100%;
		background-position: -650px -300px, -600px -450px, 0px 0px;
		background-repeat: no-repeat, no-repeat, repeat;
	`}
	overflow: hidden;
	justify-content: center;
	padding: 110px 0px;
	${media.lessThan('sm')`
		padding-top: 100px;
		background: radial-gradient(white, rgba(2, 225, 255, 0.12) 0px, transparent 100px),
		radial-gradient(white, rgba(201, 151, 90, 0.25) 0px, transparent 140px),
		linear-gradient(180deg, #0f0f0f 0%, #1e1e1e 100%);
		background-size: 100% 50%, 100% 50%, 100% 100%;
		background-position: -120px 250px, -100px 40px, 0px 0px;
		background-repeat: no-repeat, no-repeat, repeat;
	`}
`;

const StyledFlexContainer = styled(FlexDivRow)`
	width: 1160px;
	justify-content: center;
`;

const FeatureCard = styled(FlexDivCol)`
	margin-top: 90px;
	padding: 0px 40px;
	${media.lessThan('sm')`
		margin-top: 40px;
	`}
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

export default Earning;

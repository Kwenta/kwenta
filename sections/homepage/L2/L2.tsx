import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Img from 'react-optimized-image';

import {
	FlexDiv,
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
} from 'styles/common';

import { Copy, FlexSection, GridContainer, LeftSubHeader, Title } from '../common';
import media, { Media } from 'styles/media';
import Button from 'components/Button';

import Optimism from 'assets/svg/marketing/Optimism_Alpha.svg';
import TransactionSpeedNumber from 'assets/svg/marketing/1-2s.svg';
import TransactionCostNumber from 'assets/svg/marketing/50x.svg';
import Currency from 'components/Currency';

const L2 = () => {
	const { t } = useTranslation();

	const OptimismStats = (
		<div>
			<FlexDivCol>
				<OptimismTag>Powered by</OptimismTag>
				<Img src={Optimism} width={184} />
			</FlexDivCol>
			<StyledGridContainer>
				<FeatureCard>
					<Golden>
						<Img src={TransactionSpeedNumber} height={48.5} />
					</Golden>
					<FeatureContentTitle>
						<Title>{t('homepage.l2.transaction-speed')}</Title>
					</FeatureContentTitle>
				</FeatureCard>
				<FeatureCard>
					<Golden>
						<Img src={TransactionCostNumber} height={48.5} />
					</Golden>
					<FeatureContentTitle>
						<Title>{t('homepage.l2.transaction-cost')}</Title>
					</FeatureContentTitle>
				</FeatureCard>
			</StyledGridContainer>
			<Disclaimer>
				<Copy>{t('homepage.l2.disclaimer')}</Copy>
			</Disclaimer>
		</div>
	);

	return (
		<Container>
			<MiniContainer>
				<FlexSection>
					<Media greaterThanOrEqual="lg">{OptimismStats}</Media>
					<FlexDivCol>
						<StyledLeftSubHeader>{t('homepage.l2.title')}</StyledLeftSubHeader>
						<L2Copy>
							<Trans i18nKey={'homepage.l2.copy'} components={[<Emphasis />]} />
						</L2Copy>
						<Media lessThan="lg">{OptimismStats}</Media>
						<CTARow>
							<Button variant={'outline'} size={'lg'}>
								{t('homepage.l2.cta-buttons.learn-more')}
							</Button>
							<Button variant={'primary'} size={'lg'}>
								{t('homepage.l2.cta-buttons.switch-l2')}
							</Button>
						</CTARow>
					</FlexDivCol>
				</FlexSection>
			</MiniContainer>
			<MiniContainer>
				<LiveMarkets>
					<FlexGrowCol>
						<LeftSubHeader>{t('homepage.l2.markets.title')}</LeftSubHeader>
						<Copy>{t('homepage.l2.markets.copy')}</Copy>
					</FlexGrowCol>
					<FlexGrowCol>
						<FlexDivRow>
							<FlexDivColCentered>
								<Currency.Icon currencyKey={'sLINK'} height={'50px'} width={'50px'} />
								<SynthCaption>sLINK</SynthCaption>
							</FlexDivColCentered>
							<FlexDivColCentered>
								<Currency.Icon currencyKey={'sETH'} height={'50px'} width={'50px'} />
								<SynthCaption>sETH</SynthCaption>
							</FlexDivColCentered>
							<FlexDivColCentered>
								<Currency.Icon currencyKey={'sUSD'} height={'50px'} width={'50px'} />
								<SynthCaption>sUSD</SynthCaption>
							</FlexDivColCentered>
							<FlexDivColCentered>
								<Currency.Icon currencyKey={'sBTC'} height={'50px'} width={'50px'} />
								<SynthCaption>sBTC</SynthCaption>
							</FlexDivColCentered>
						</FlexDivRow>
					</FlexGrowCol>
				</LiveMarkets>
			</MiniContainer>
		</Container>
	);
};

const LiveMarkets = styled(FlexSection)``;

const L2Copy = styled(Copy)`
	margin-bottom: 48px;
	${media.lessThan('lg')`
		margin-bottom: 24px;
	`}
`;

const OptimismTag = styled(Copy)`
	margin-bottom: 6px;
`;

const Disclaimer = styled.div`
	width: 80%;
	margin: 48px 0;
`;

const Golden = styled.div`
	margin-bottom: 10px;
`;

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.white};
`;

const StyledGridContainer = styled(GridContainer)`
	${media.lessThan('lg')`
		grid-template-columns: repeat(4, auto);
	`}
`;

const FlexGrowCol = styled(FlexDivCol)`
	flex: 1;
	width: 100%;
	margin: 24px 0;
`;

const Container = styled.div`
	margin-bottom: 150px;
	${media.lessThan('lg')`
		margin-bottom: 75px;
	`}
`;

const MiniContainer = styled.div`
	padding-bottom: 75px;
	${media.lessThan('lg')`
		padding-bottom: 37.5px;
	`}
`;

const StyledLeftSubHeader = styled(LeftSubHeader)`
	max-width: 500px;
	padding-top: 10px;
	padding-bottom: 10px;
	${media.lessThan('lg')`
		padding-top: 0;
		padding-bottom: 56px;
	`}
`;

const FeatureCard = styled(FlexDivCol)`
	margin-top: 64px;
	margin-bottom: 16px;
`;

const CTARow = styled(FlexDiv)`
	> * {
		margin-right: 16px;
	}
`;

const FeatureContentTitle = styled(FlexDivCentered)`
	padding-bottom: 14px;
`;

const SynthCaption = styled(Copy)`
	margin-top: 12px;
`;

export default L2;

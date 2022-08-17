import Link from 'next/link';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import MarketOrderPreview from 'assets/png/marketing/market-order-preview.png';
import LogoNoTextSVG from 'assets/svg/brand/logo-no-text.svg';
import Button from 'components/Button';
import PoweredBySynthetix from 'components/PoweredBySynthetix';
import Webp from 'components/Webp';
import ROUTES from 'constants/routes';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { futuresAccountTypeState } from 'store/futures';
import { FlexDivColCentered, GridDiv, Paragraph } from 'styles/common';
import media from 'styles/media';

import { StackSection } from '../common';

const Hero = () => {
	const { t } = useTranslation();
	const [accountType] = usePersistedRecoilState(futuresAccountTypeState);

	return (
		<StackSection>
			<Container>
				<LogoContainer>
					<LogoNoTextSVG />
				</LogoContainer>
				<Header>{t('homepage.hero.title')}</Header>
				<ProductDescription>
					<Trans i18nKey={'homepage.hero.copy'} components={[<Emphasis />]} />
				</ProductDescription>
				<SynthetixContainer>
					<PoweredBySynthetix />
				</SynthetixContainer>
				<CTAContainer>
					<Link href={ROUTES.Markets.Home(accountType)}>
						<Button variant="primary" isRounded={false} size="md">
							{t('homepage.nav.trade-now')}
						</Button>
					</Link>
				</CTAContainer>
				<HeroImageContainer>
					<Webp srcOrSrcset={MarketOrderPreview} StyledImg={HeroImage} />
				</HeroImageContainer>
			</Container>
		</StackSection>
	);
};

const Container = styled(FlexDivColCentered)`
	width: 100vw;
	${media.greaterThan('sm')`
		background: radial-gradient(white, rgba(2, 225, 255, 0.15) 0px, transparent 220px),
			radial-gradient(white, rgba(201, 151, 90, 0.25) 0px, transparent 500px);
		background-size: 100% 150%, 100% 150%;
		background-position: -600px -250px, -200px -250px;
		background-repeat: no-repeat, no-repeat;
	`}
	overflow: hidden;
	justify-content: center;
	padding: 110px 0px;
	${media.lessThan('sm')`
		padding-top: 100px;
		background: radial-gradient(white, rgba(2, 225, 255, 0.08) 0px, transparent 120px),
		radial-gradient(white, rgba(201, 151, 90, 0.15) 0px, transparent 180px);
		background-size: 100% 100%, 100% 100%;
		background-position: -100px 120px, 50px 0px;
		background-repeat: no-repeat, no-repeat;
	`}
`;

const LogoContainer = styled.div`
	${media.lessThan('sm')`
	svg {
		width: 107px;
	}
`}
`;

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const Header = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	max-width: 636px;
	font-size: 80px;
	line-height: 85%;
	text-align: center;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryGold};
	text-shadow: 0px 0px 60px rgba(208, 168, 117, 0.35), 0px -0.8px 0px rgba(255, 255, 255);
	padding-top: 40px;
	${media.lessThan('sm')`
		font-size: 40px;
		width: 346px;
		padding-top: 10px;
	`}
`;

const ProductDescription = styled(Paragraph)`
	font-family: ${(props) => props.theme.fonts.regular};
	max-width: 530px;
	font-size: 24px;
	line-height: 120%;
	text-align: center;
	color: #bdbdbd;
	padding-top: 16px;
	${media.lessThan('sm')`
		font-size: 16px;
		width: 346px;
	`}
`;

const HeroImageContainer = styled(GridDiv)`
	width: 100vw;
	overflow: hidden;
	display: grid;
	justify-content: center;
	margin-top: 97px;
	margin-bottom: 201px;
	${media.lessThan('sm')`
		margin-bottom: 101px;
	`}
`;

const HeroImage = styled.img`
	width: 960px;
	aspect-ratio: 1.72;
	${media.lessThan('md')`
		width: 785px;
	`}
	${media.lessThan('sm')`
		width: 345px;
	`}
	background: linear-gradient(180deg, #C9975A 0%, #94F2FF 100%);
	padding: 1px;
	border-radius: 8px;
`;

const SynthetixContainer = styled.div`
	margin: 25px 0px 0px 0;
	${media.lessThan('sm')`
		display: none;
	`}
`;

const CTAContainer = styled.div`
	margin: 50px 0px 0px 0;
	z-index: 1;
`;

export default Hero;

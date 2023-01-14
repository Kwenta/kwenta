import Link from 'next/link';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import MarketOrderPreview from 'assets/png/marketing/market-order-preview.png';
import Button from 'components/Button';
import { FlexDivColCentered } from 'components/layout/flex';
import { GridDiv } from 'components/layout/grid';
import PoweredBySynthetix from 'components/PoweredBySynthetix';
import * as Text from 'components/Text';
import Webp from 'components/Webp';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import ROUTES from 'constants/routes';
import media from 'styles/media';

import { StackSection } from './common';

const Hero = () => {
	const { t } = useTranslation();

	return (
		<StackSection>
			<Container>
				<Header>{t('homepage.hero.title')}</Header>
				<ProductDescription>
					<Trans i18nKey={'homepage.hero.copy'} components={[<Emphasis />]} />
				</ProductDescription>
				<SynthetixContainer>
					<PoweredBySynthetix />
				</SynthetixContainer>
				<CTAContainer>
					<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
						<Button variant="flat" textColor="yellow" size="md">
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
	overflow: hidden;
	justify-content: center;
	padding: 20px 0px;
`;

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const Header = styled(Text.Body).attrs({ variant: 'bold', mono: true })`
	max-width: 636px;
	font-size: 80px;
	line-height: 85%;
	text-align: center;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryYellow};
	${media.lessThan('sm')`
		font-size: 40px;
		width: 346px;
		padding-top: 10px;
	`}
`;

const ProductDescription = styled(Text.Body)`
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
	margin-bottom: 150px;
	${media.lessThan('sm')`
		margin-bottom: 101px;
	`}
`;

const HeroImage = styled.img`
	width: 1060px;
	${media.lessThan('md')`
		width: 785px;
	`}
	${media.lessThan('sm')`
		width: 345px;
	`}
	background: linear-gradient(180deg,#71623f 0%,#4D4F21 100%);
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

import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LogoGoldSvg from 'assets/inline-svg/brand/logo-gold.svg';
import Mark from 'assets/svg/brand/mark.svg';

import Button from 'components/Button';
import media from 'styles/media';
import { ExternalLink, Paragraph } from 'styles/common';

// this page is temp - so no need to translate.
const ComingSoon = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<PageContainer>
				<Header>
					<LogoGoldSvg />
				</Header>
				<Content>
					<Copy>coming soon</Copy>
					<Title>Derivatives Trading with Infinite Liquidity</Title>
					<Frame>
						<Heading>
							Sign up for a chance to be part of the <Underlined>Kwenta Elite!</Underlined>
						</Heading>
						<StyledParagraph>
							Kwenta Elite members will get early access to the exchange and a welcome package
							including sUSD and an NFT that grants exclusive access to a group of DeFi’s finest
							traders.
						</StyledParagraph>
						<div>
							<ExternalLink href="https://synthetixio.typeform.com/to/N51aKT2h">
								<StyledButton isRounded={true} variant="primary" size="lg">
									Sign up
								</StyledButton>
							</ExternalLink>
						</div>
						<FrameOuter />
					</Frame>
				</Content>
			</PageContainer>
		</>
	);
};

const PageContainer = styled.div`
	padding: 20px;
	color: ${(props) => props.theme.colors.white};
	height: 100vh;
	background: url(${Mark}) no-repeat center;
	background-size: contain;
`;

const Content = styled.main`
	text-align: center;
	max-width: 1200px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: calc(100% - 40px);
`;

const Copy = styled.div`
	font-size: 16px;
	background: ${(props) => props.theme.colors.gold};
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.goldColors.color1};
	padding-bottom: 16px;
	text-transform: uppercase;
	${media.lessThan('sm')`
		font-size: 16px;
	`}
`;

const Title = styled.h1`
	max-width: 500px;
	margin: 0 auto;
	font-family: ${(props) => props.theme.fonts.bold};
	line-height: 57.6px;
	letter-spacing: 0.2px;
	font-size: 48px;
	padding-bottom: 57px;
	${media.lessThan('sm')`
		padding-bottom: 50px;
		font-size: 32px;
		line-height: 38.4px;
	`}
`;

const Header = styled.header``;

const Frame = styled.div`
	text-align: center;
	max-width: 645px;
	width: 100%;
	margin: 0 auto;
	position: relative;
	padding: 48px 24px;
	text-align: center;
	border: 1px solid ${(props) => props.theme.colors.goldColors.color1};
	${media.lessThan('sm')`
		padding: 24px;
	`}
`;

const Heading = styled.h4`
	margin: 0;
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.bold};
	line-height: 24px;
	padding-bottom: 20px;
`;

const StyledParagraph = styled(Paragraph)`
	font-size: 14px;
	line-height: 19.6px;
	padding-bottom: 24px;
	max-width: 448px;
	margin: 0 auto;
`;

const StyledButton = styled(Button)`
	padding: 0 55px;
`;

const FrameOuter = styled.div`
	position: absolute;
	top: -10px;
	right: 8px;
	bottom: -10px;
	left: 8px;
	pointer-events: none;
	border: 1px solid ${(props) => props.theme.colors.goldColors.color1};
`;

const Underlined = styled.span`
	border-bottom: 1.5px solid ${(props) => props.theme.colors.goldColors.color1};
`;

export default ComingSoon;

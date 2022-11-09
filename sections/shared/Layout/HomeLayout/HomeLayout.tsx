import router from 'next/router';
import { FC } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import FuturesBordersSvg from 'assets/svg/app/futures-borders.svg';
import LinkWhiteIcon from 'assets/svg/app/link-white.svg';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ROUTES from 'constants/routes';
import { RefetchProvider } from 'contexts/RefetchContext';
import { FullScreenContainer } from 'styles/common';
import media from 'styles/media';
import { themes } from 'styles/theme';
import darkTheme from 'styles/theme/colors/dark';

import Footer from './Footer';
import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<ThemeProvider theme={themes['dark']}>
		<DesktopOnlyView>
			<FuturesBannerContainer>
				<FuturesBannerLinkWrapper>
					<>
						<FuturesLink
							href="https://app.aelin.xyz/pool/mainnet/0x21f4f88a95f656ef4ee1ea107569b3b38cf8daef"
							target="_blank"
						>
							SNX Staker & Early Synth Trader $KWENTA distribution live on Aelin until 14 November!
							Check your eligibility
						</FuturesLink>
						<NavSpan onClick={() => router.push(ROUTES.Dashboard.Home)}>here</NavSpan>.
						<LinkWhiteIcon />
					</>
				</FuturesBannerLinkWrapper>

				<DivBorder />
				<FuturesBordersSvg />
				<DivBorder />
			</FuturesBannerContainer>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<FuturesBannerContainer>
				<>
					<FuturesLink
						href="https://app.aelin.xyz/pool/mainnet/0x21f4f88a95f656ef4ee1ea107569b3b38cf8daef"
						target="_blank"
					>
						SNX Staker & Early Synth Trader $KWENTA distribution live on Aelin until 14 November!
					</FuturesLink>
					<NavSpan onClick={() => router.push(ROUTES.Dashboard.Home)}>
						Check your eligibility here.
					</NavSpan>
				</>
			</FuturesBannerContainer>
		</MobileOrTabletView>

		<FullScreenContainer>
			<GlobalStyle />
			<Header />
			<RefetchProvider>{children}</RefetchProvider>
			<Footer />
		</FullScreenContainer>
	</ThemeProvider>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
		background-color: ${darkTheme.background};
		color: ${darkTheme.text.value};
	}
`;

const NavSpan = styled.span`
	cursor: help;
	${media.lessThan('md')`
		margin-left: 5px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		text-shadow: 0px 1px 2px ${(props) => props.theme.colors.transparentBlack};
	`}
`;

const DivBorder = styled.div`
	height: 2px;
	background: ${(props) => props.theme.colors.goldColors.color1};
	flex-grow: 1;
`;

const FuturesLink = styled.a`
	margin-right: 5px;
`;

const FuturesBannerContainer = styled.div`
	height: 65px;
	width: 100%;
	display: flex;
	align-items: center;
	background: linear-gradient(
		180deg,
		${(props) => props.theme.colors.goldColors.color1} 0%,
		${(props) => props.theme.colors.goldColors.color2} 100%
	);
	${media.lessThan('md')`
		position: relative;
		width: 100%;
		display: flex;
		margin-bottom: 0px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		background: transaparent;
		padding: 22px 10px;
		border-radius: 0px;
		gap: 5px;
		text-shadow: 0px 1px 2px ${(props) => props.theme.colors.transparentBlack};
	`}
`;

const FuturesBannerLinkWrapper = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;
	text-shadow: 0px 1px 2px ${(props) => props.theme.colors.transparentBlack};
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export default HomeLayout;

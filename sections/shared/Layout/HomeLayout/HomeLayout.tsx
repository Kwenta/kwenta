import router from 'next/router';
import { FC } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ROUTES from 'constants/routes';
import { RefetchProvider } from 'contexts/RefetchContext';
import { FullScreenContainer } from 'styles/common';
import media from 'styles/media';
import { themes } from 'styles/theme';
import darkTheme from 'styles/theme/colors/dark';

import Background from './Background';
import Footer from './Footer';
import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<ThemeProvider theme={themes['dark']}>
		<Background />
		<DesktopOnlyView>
			<FuturesBannerContainer>
				<FuturesBannerLinkWrapper>
					<>
						<FuturesLink
							href="https://app.aelin.xyz/pool/mainnet/0x21f4f88a95f656ef4ee1ea107569b3b38cf8daef"
							target="_blank"
						>
							SNX Staker & Early Synth Trader $KWENTA distribution live on Aelin until November 14th
						</FuturesLink>
						<NavSpan onClick={() => router.push(ROUTES.Dashboard.Home)}>
							Check your eligibility
						</NavSpan>
					</>
				</FuturesBannerLinkWrapper>
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
	background: #313131;
	padding: 4px 9px;
	border-radius: 20px;

	${media.lessThan('md')`
		margin-left: 5px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		text-shadow: 0px 1px 2px ${(props) => props.theme.colors.transparentBlack};
	`}
`;

const FuturesLink = styled.a`
	margin-right: 5px;
	background: #313131;
	padding: 4px 9px;
	border-radius: 20px;
`;

const FuturesBannerContainer = styled.div`
	height: 70px;
	width: 100%;
	display: flex;
	align-items: center;
	margin-bottom: -35px;

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
	`}
`;

const FuturesBannerLinkWrapper = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;

	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export default HomeLayout;

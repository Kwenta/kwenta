import { FC } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
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
							href="https://mirror.xyz/kwenta.eth/ueasaL_H0IdPe5-U1Z6jqGfa_B2HW3xf0_CSIR34ueE"
							target="_blank"
						>
							Council nominations are live in the Kwenta Discord until Nov 22nd. Click to learn
							more.
						</FuturesLink>
					</>
				</FuturesBannerLinkWrapper>
			</FuturesBannerContainer>
		</DesktopOnlyView>
		<MobileOrTabletView>
			<FuturesBannerContainer>
				<>
					<FuturesLink
						href="https://mirror.xyz/kwenta.eth/ueasaL_H0IdPe5-U1Z6jqGfa_B2HW3xf0_CSIR34ueE"
						target="_blank"
					>
						Council nominations are live in the Kwenta Discord until Nov 22nd. Click to learn more.
					</FuturesLink>
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

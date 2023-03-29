import { FC } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import { FullScreenContainer } from 'styles/common';
import { themes } from 'styles/theme';
import darkTheme from 'styles/theme/colors/dark';

import Background from './Background';
import Banner from './Banner';
import Footer from './Footer';
import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<ThemeProvider theme={themes.dark}>
		<Background />
		<Banner />

		<STV>
			<GlobalStyle />
			<Header />
			{children}
			<Footer />
		</STV>
	</ThemeProvider>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
		background-color: ${darkTheme.background};
		color: ${darkTheme.text.value};
	}
`;

const STV = styled(FullScreenContainer)`
	overflow-y: scroll;
`;

export default HomeLayout;

import { FC } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

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
	<ThemeProvider theme={themes['dark']}>
		<Background />
		<Banner />

		<FullScreenContainer>
			<GlobalStyle />
			<Header />
			{children}
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

export default HomeLayout;

import { FC } from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

import { RefetchProvider } from 'contexts/RefetchContext';
import { FullScreenContainer } from 'styles/common';
import { themes } from 'styles/theme';
import darkTheme from 'styles/theme/colors/dark';

import Footer from './Footer';
import Header from './Header';
import type { HeaderProps } from './Header';

type HomeLayoutProps = HeaderProps & {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ setCurrentPage, children }) => (
	<ThemeProvider theme={themes['dark']}>
		<FullScreenContainer>
			<GlobalStyle />
			<Header setCurrentPage={setCurrentPage} />
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

export default HomeLayout;

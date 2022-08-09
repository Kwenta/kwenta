import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';

import { RefetchProvider } from 'contexts/RefetchContext';
import { FullScreenContainer } from 'styles/common';

import Footer from './Footer';
import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<FullScreenContainer>
		<GlobalStyle />
		<Header />
		<RefetchProvider>{children}</RefetchProvider>
		<Footer />
	</FullScreenContainer>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

export default HomeLayout;

import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';

import { RefetchProvider } from 'contexts/RefetchContext';
import { FullScreenContainer } from 'styles/common';

import Footer from './Footer';
import Header from './Header';
import type { HeaderProps } from './Header';

type HomeLayoutProps = HeaderProps & {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ setCurrentPage, children }) => (
	<FullScreenContainer>
		<GlobalStyle />
		<Header setCurrentPage={setCurrentPage} />
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

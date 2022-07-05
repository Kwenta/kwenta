import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';
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
		{children}
		<Footer />
	</FullScreenContainer>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

export default HomeLayout;

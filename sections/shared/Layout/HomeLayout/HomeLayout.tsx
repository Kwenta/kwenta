import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';
import Footer from './Footer';

import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<>
		<GlobalStyle />
		<Header />
		{children}
		<Footer />
	</>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

export default HomeLayout;

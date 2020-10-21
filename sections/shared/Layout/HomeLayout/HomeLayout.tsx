import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Footer from './Footer';

import Header from './Header';

type HomeLayoutProps = {
	children: React.ReactNode;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => (
	<>
		<GlobalStyle />
		<Header />
		<Content>{children}</Content>
		<Footer />
	</>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

const Content = styled.div`
	${(props) => props.theme.animations.show};
`;

export default HomeLayout;

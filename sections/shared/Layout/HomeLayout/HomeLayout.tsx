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
		<Container>
			<Header />
			{children}
			<Footer />
		</Container>
	</>
);

const GlobalStyle = createGlobalStyle`
	body {
		overflow-x: hidden;
	}
`;

const Container = styled.div`
	${(props) => props.theme.animations.show};
`;

export default HomeLayout;

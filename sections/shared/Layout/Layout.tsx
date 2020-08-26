import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import Header from './Header';
import Footer from './Footer';

import { linkCSS } from 'styles/common';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			<PageContainer>
				<Header />
				<Content>{children}</Content>
				<Footer />
			</PageContainer>
		</>
	);
};

const PageContainer = styled.div`
	max-width: 1400px;
	margin: 0 auto;
`;

const Content = styled.section``;

const GlobalStyle = createGlobalStyle`
	* {
		box-sizing: border-box;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}


	body {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;

		background-color: ${(props) => props.theme.colors.black};
		color: ${(props) => props.theme.colors.blueberry};
		font-family: ${(props) =>
			`${props.theme.fonts.regular}, -apple-system, BlinkMacSystemFont, sans-serif;`};
		font-size: 16px;
		margin: 0;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	a {
		${linkCSS};
		color: ${(props) => props.theme.colors.white};
	}
`;

export default Layout;

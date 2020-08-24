import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';

import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			<Header />
			<section>{children}</section>
			<Footer />
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		background-color: ${(props) => props.theme.colors.black};
		color: ${(props) => props.theme.colors.white};
		font-family: ${(props) => props.theme.fonts.regular}
  }
`;

export default Layout;

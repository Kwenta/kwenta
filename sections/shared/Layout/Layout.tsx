import i18n from 'i18n';
import { FC, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

import { useAppSelector } from 'state/hooks';
import { selectLanguage } from 'state/preferences/selectors';
import { linkCSS } from 'styles/common';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	const language = useAppSelector(selectLanguage);

	useEffect(() => {
		i18n.changeLanguage(language);
	}, [language]);

	return (
		<>
			<GlobalStyle />
			{children}
		</>
	);
};

const GlobalStyle = createGlobalStyle`
	body {
		background-color: ${(props) => props.theme.colors.selectedTheme.background};
	}

	a {
		${linkCSS};
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export default Layout;

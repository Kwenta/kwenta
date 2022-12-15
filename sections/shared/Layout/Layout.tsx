import i18n from 'i18n';
import { FC, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { createGlobalStyle } from 'styled-components';

import { languageState } from 'store/app';
import { linkCSS } from 'styles/common';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	const language = useRecoilValue(languageState);

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

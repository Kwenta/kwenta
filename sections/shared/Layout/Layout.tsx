import i18n from 'i18n';
import { FC, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { createGlobalStyle } from 'styled-components';

import { zIndex } from 'constants/ui';
import { languageState } from 'store/app';
import { linkCSS } from 'styles/common';
import media from 'styles/media';

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

	/* blocknative onboard style overrides */
	.bn-onboard-custom {
		&&& {
			font-family: ${(props) => props.theme.fonts.regular};
			color: ${(props) => props.theme.colors.common.primaryWhite};
			
		}
		&&.bn-onboard-modal {
			z-index: ${zIndex.DIALOG_OVERLAY};
			background: rgba(0, 0, 0, 0.8);
			${media.lessThan('sm')`
				align-items: flex-start;
			`};
		}
		&&.bn-onboard-modal-content-header-icon {
			background: none;
		}
		&&.bn-onboard-selected-wallet {
			background-color: ${(props) => props.theme.colors.navy};
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}
		&&.bn-onboard-modal-content {
			background-color: ${(props) => props.theme.colors.elderberry};
			${media.lessThan('sm')`
				height: 100%;
			`};
		}
		&&.bn-onboard-select-wallet-info {
			cursor: pointer;
			color: ${(props) => props.theme.colors.common.primaryWhite};
		}
		&&.bn-onboard-dark-mode-background-hover {
			&:hover {
				background-color: ${(props) => props.theme.colors.navy};
			}
		}
		&&.bn-onboard-prepare-button {
			border-radius: 2px;
			color: ${(props) => props.theme.colors.common.primaryWhite} ;
			background-color: ${(props) => props.theme.colors.elderberry} ;
			border: 1px solid ${(props) => props.theme.colors.navy} ;
		}
		.bn-onboard-clickable {
			color: ${(props) => props.theme.colors.common.primaryWhite} !important;
		}		
	}
`;

export default Layout;

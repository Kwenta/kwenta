import { FC, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useRecoilValue } from 'recoil';
import i18n from 'i18n';

import { zIndex } from 'constants/ui';

import { linkCSS } from 'styles/common';
import media from 'styles/media';

import { languageState } from 'store/app';

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
	${media.greaterThan('mdUp')`
		::-webkit-scrollbar {
			width: 13px;
			height: 13px;
		}

		::-webkit-scrollbar-track {
			box-shadow: inset 0 0 13px 13px transparent;
			border: solid 3px transparent;
		}

		::-webkit-scrollbar-thumb {
			box-shadow: inset 0 0 13px 13px #2C2C42;
			border: solid 3px transparent;
			border-radius: 16px;
			&:hover {
				box-shadow: inset 0 0 13px 13px #3B3B5A;
			}
		}
	`};

	body {
		background-color: ${(props) => props.theme.colors.black};
		color: ${(props) => props.theme.colors.blueberry};
	}

	a {
		${linkCSS};
		color: ${(props) => props.theme.colors.white};
	}

	.bn-notify-custom {
 	   && {
			font-family: ${(props) => props.theme.fonts.regular};
		}
	}
	/* blocknative onboard style overrides */
	.bn-onboard-custom {
		&&& {
			font-family: ${(props) => props.theme.fonts.regular};
			color: ${(props) => props.theme.colors.white};
			
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
			color: ${(props) => props.theme.colors.white};
		}
		&&.bn-onboard-modal-content {
			background-color: ${(props) => props.theme.colors.elderberry};
			${media.lessThan('sm')`
				height: 100%;
			`};
		}
		&&.bn-onboard-select-wallet-info {
			cursor: pointer;
			color: ${(props) => props.theme.colors.white};
		}
		&&.bn-onboard-dark-mode-background-hover {
			&:hover {
				background-color: ${(props) => props.theme.colors.navy};
			}
		}
		&&.bn-onboard-prepare-button {
			border-radius: 2px;
			color: ${(props) => props.theme.colors.white} ;
			background-color: ${(props) => props.theme.colors.elderberry} ;
			border: 1px solid ${(props) => props.theme.colors.navy} ;
		}
		.bn-onboard-clickable {
			color: ${(props) => props.theme.colors.white} !important;
		}		
	}
`;

export default Layout;

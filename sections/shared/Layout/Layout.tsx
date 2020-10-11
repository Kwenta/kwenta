import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';

import { zIndex } from 'constants/ui';

import { linkCSS } from 'styles/common';
import media from 'styles/media';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => (
	<>
		<GlobalStyle />
		{children}
	</>
);

const GlobalStyle = createGlobalStyle`
	* {
		box-sizing: border-box;
	}

	#__next {
		width: 100%;
		height: 100%;
		position: relative;
	}

	body {
		font-family: 'AkkuratLLWeb-Regular', -apple-system, BlinkMacSystemFont, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		margin: 0;
		text-rendering: optimizeSpeed;
		position: relative;
		min-height: 100vh;
		scroll-behavior: smooth;
		background-color: ${(props) => props.theme.colors.black};
		color: ${(props) => props.theme.colors.blueberry};
		font-size: 12px;
		line-height: 140%;
	}

	a {
		${linkCSS};
		color: ${(props) => props.theme.colors.white};
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}	

	@font-face {
		font-family: 'AkkuratLLWeb-Regular';
		src: url('/fonts/AkkuratLLWeb-Regular.woff2') format('woff2'), 
			 url('/fonts/AkkuratLLWeb-Regular.woff') format('woff');
		font-display: sans-serif;
	}

	@font-face {
		font-family: 'AkkuratLLWeb-Bold';
		src: url('/fonts/AkkuratLLWeb-Bold.woff2') format('woff2'), 
		     url('/fonts/AkkuratLLWeb-Bold.woff') format('woff');
		font-display: sans-serif;
	}

	@font-face {
		font-family: 'AkkuratMonoLLWeb-Regular';
		src: url('/fonts/AkkuratMonoLLWeb-Regular.woff2') format('woff2'), 
		     url('/fonts/AkkuratMonoLLWeb-Regular.woff') format('woff');
		font-display: monospace;
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

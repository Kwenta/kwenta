import { ADDRESSES } from '@kwenta/sdk/contracts/constants';
import { DefaultTheme } from 'styled-components';

import { RGB, SocketCustomizationProps } from 'components/SocketBridge/types';
import { chain } from 'containers/Connector/config';

export const DEFAULT_WIDTH = 360;
export const DEFAULT_MOBILE_WIDTH = 180;
export const SOCKET_SOURCE_TOKEN_ADDRESS =
	ADDRESSES.SUSD[chain.mainnet.id] || '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const SOCKET_DEST_TOKEN_ADDRESS = ADDRESSES.SUSD[chain.optimism.id];

export default function hexToRGB(hex: string): RGB {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return {
		r,
		g,
		b,
	};
}

export const socketDefaultChains = [
	chain.arbitrum.id,
	chain.avalanche.id,
	chain.bsc.id,
	chain.mainnet.id,
	chain.optimism.id,
	chain.polygon.id,
];

export function customizeSocket(theme: DefaultTheme): SocketCustomizationProps {
	const background = hexToRGB(theme.colors.selectedTheme.input.background);
	const text = hexToRGB(theme.colors.selectedTheme.button.text.primary);
	const primaryButtonBg = hexToRGB(theme.colors.selectedTheme.socket.accent);

	return {
		width: window.innerWidth > 768 ? DEFAULT_WIDTH : DEFAULT_MOBILE_WIDTH,
		responsiveWidth: true,
		borderRadius: 1,
		secondary: `rgb(${background.r},${background.g},${background.b})`, //socket surface
		primary: `rgb(${background.r},${background.g},${background.b})`, //socket bg
		accent: `rgb(${primaryButtonBg.r},${primaryButtonBg.g},${primaryButtonBg.b})`, //toggle-slippage accent
		onAccent: `rgb(${text.r},${text.g},${text.b})`, //toggle thumb
		interactive: `rgb(${primaryButtonBg.r},${primaryButtonBg.g},${primaryButtonBg.b})`, //asset toggle
		onInteractive: `rgb(${text.r},${text.g},${text.b})`, //asset toggle text
		text: `rgb(${text.r},${text.g},${text.b})`, //main text
		secondaryText: `rgb(${text.r},${text.g},${text.b})`, //secondary text
		fontFamily: `AkkuratLLWeb-Regular`,
	};
}

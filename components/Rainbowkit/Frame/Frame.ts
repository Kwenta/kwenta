import { Chain, Wallet } from '@rainbow-me/rainbowkit';
import { InjectedConnector } from 'wagmi/connectors/injected';

import FrameIcon from 'assets/png/rainbowkit/frame.png';

type FrameOptions = {
	chains: Chain[];
	shimDisconnect?: boolean;
};

const Frame = ({ chains, shimDisconnect }: FrameOptions): Wallet => ({
	id: 'frame',
	iconBackground: '#000',
	name: 'Frame',
	iconUrl: async () => FrameIcon,
	downloadUrls: {
		browserExtension:
			'https://chrome.google.com/webstore/detail/frame-companion/ldcoohedfbjoobcadoglnnmmfbdlmmhf',
	},
	createConnector: () => {
		const connector = new InjectedConnector({ chains, options: { shimDisconnect } });
		return {
			connector,
		};
	},
});

export default Frame;

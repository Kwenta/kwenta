import { Chain, getWalletConnectConnector, Wallet } from '@rainbow-me/rainbowkit';

import GnosisIcon from 'assets/png/rainbowkit/gnosis.png';

import { SafeConnector } from './SafeConnector';

type SafeOptions = {
	chains: Chain[];
};

const Safe = ({ chains }: SafeOptions): Wallet => ({
	id: 'safe',
	iconBackground: '#FFF',
	name: 'Gnosis Safe',
	iconUrl: async () => GnosisIcon,
	downloadUrls: {
		android: 'https://play.google.com/store/apps/details?id=io.gnosis.safe',
		ios: 'https://apps.apple.com/us/app/gnosis-safe/idid1515759131',
	},
	createConnector: () => {
		const connector = getWalletConnectConnector({ chains });
		return {
			connector,
		};
	},
});

export default Safe;

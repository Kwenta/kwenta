import { SafeConnector } from '@gnosis.pm/safe-apps-wagmi';
import { Chain, Wallet } from '@rainbow-me/rainbowkit';

import GnosisIcon from 'assets/png/rainbowkit/gnosis.png';

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
	// @ts-ignore
	createConnector: () => {
		const connector = new SafeConnector({ chains });
		return {
			connector,
		};
	},
});

export default Safe;

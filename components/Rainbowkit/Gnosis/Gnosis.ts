import { Chain, Wallet, getWalletConnectConnector } from '@rainbow-me/rainbowkit';

import GnosisIcon from 'assets/svg/rainbowkit/gnosis.svg';

type SafeOptions = {
	chains: Chain[];
};

const Safe = ({ chains }: SafeOptions): Wallet => ({
	id: 'safe',
	iconBackground: '#FFF',
	name: 'Gnosis Safe',
	iconUrl: GnosisIcon,
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

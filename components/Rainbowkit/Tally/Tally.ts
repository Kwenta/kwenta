import { Chain, Wallet } from '@rainbow-me/rainbowkit';
import { InjectedConnector } from 'wagmi/connectors/injected';

import TallyIcon from 'assets/png/rainbowkit/tallyho.png';

type TallyOptions = {
	chains: Chain[];
	shimDisconnect?: boolean;
};

const Tally = ({ chains, shimDisconnect }: TallyOptions): Wallet => ({
	id: 'tally',
	iconBackground: '#FFF',
	name: 'Tally Ho',
	iconUrl: async () => TallyIcon,
	downloadUrls: {
		android: 'https://play.google.com/store/apps/details?id=io.gnosis.Tally',
		ios: 'https://apps.apple.com/us/app/gnosis-Tally/idid1515759131',
	},
	// @ts-ignore
	createConnector: () => {
		const connector = new InjectedConnector({ chains, options: { shimDisconnect } });
		return {
			connector,
		};
	},
});

export default Tally;

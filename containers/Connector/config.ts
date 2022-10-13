import { connectorsForWallets, wallet } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import Safe from 'components/Rainbowkit/Gnosis';
import Tally from 'components/Rainbowkit/Tally';
import { BLAST_NETWORK_LOOKUP } from 'constants/network';

export const initRainbowkit = () => {
	const { chains, provider } = configureChains(
		[chain.optimism, chain.mainnet, chain.optimismGoerli, chain.goerli],
		[
			jsonRpcProvider({
				rpc: (networkChain) => {
					return !BLAST_NETWORK_LOOKUP[networkChain.id]
						? {
								http: networkChain.rpcUrls.default,
						  }
						: {
								http: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${
									process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
								}`,
						  };
				},
				stallTimeout: 5000,
				priority: 0,
			}),
			publicProvider({ stallTimeout: 5000, priority: 5 }),
		]
	);

	const connectors = connectorsForWallets([
		{
			groupName: 'Popular',
			wallets: [
				Safe({ chains }),
				wallet.metaMask({ chains }),
				wallet.rainbow({ chains }),
				wallet.coinbase({ appName: 'Kwenta', chains }),
				wallet.walletConnect({ chains }),
			],
		},
		{
			groupName: 'More',
			wallets: [
				wallet.ledger({ chains }),
				wallet.brave({ chains, shimDisconnect: true }),
				wallet.trust({ chains }),
				Tally({ chains, shimDisconnect: true }),
			],
		},
	]);

	const wagmiClient = createClient({
		autoConnect: true,
		connectors,
		provider,
	});

	return {
		wagmiClient,
		chains,
	};
};

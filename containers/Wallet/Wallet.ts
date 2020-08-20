import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import Onboard from 'bnc-onboard';

import { ethers } from 'ethers';
import { API as OnboardApi, Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { getWallets } from './config';
import { DEFAULT_NETWORK_ID } from 'constants/network';

type Provider = ethers.providers.Web3Provider;
type Network = ethers.providers.Network;
type Signer = ethers.Signer;

const useWallet = () => {
	const [provider, setProvider] = useState<Provider | null>(null);
	const [onboard, setOnboard] = useState<OnboardApi | null>(null);
	const [signer, setSigner] = useState<Signer | null>(null);
	const [network, setNetwork] = useState<Network | null>(null);
	const [walletAddress, setWalletAddress] = useState<string | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [networkId, setNetworkId] = useState<number | null>(null);

	const connectWallet = async () => {
		const onboard = Onboard({
			dappId: process.env.BN_ONBOARD_API_KEY,
			hideBranding: true,
			networkId: 1,
			subscriptions: {
				address: (address: string | null) => {
					setWalletAddress(address);
				},
				network: async (networkId: number) => {
					onboard?.config({ networkId });
					setNetworkId(networkId);
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const ethersProvider = new ethers.providers.Web3Provider(wallet.provider);
						setProvider(ethersProvider);
						setNetwork(await ethersProvider.getNetwork());
					} else {
						setProvider(null);
						setNetwork(null);
					}
				},
			},
			walletSelect: {
				wallets: getWallets(DEFAULT_NETWORK_ID),
			},
			// walletCheck: [{ checkName: 'connect' }, { checkName: 'accounts' }, { checkName: 'network' }],
		});

		await onboard.walletSelect();
		// await onboard.walletCheck();
		setOnboard(onboard);
	};

	useEffect(() => {
		if (provider && walletAddress) {
			setSigner(provider.getSigner());
		}
	}, [provider, walletAddress]);

	return {
		provider,
		signer,
		network,
		walletAddress,
		connectWallet,
		error,
		onboard,
		isWalletConnected: walletAddress != null,
		networkId,
	};
};

const Wallet = createContainer(useWallet);

export default Wallet;

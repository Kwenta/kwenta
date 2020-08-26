import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { NetworkIds, SUPPORTED_NETWORKS } from '@synthetixio/js';

import { ethers } from 'ethers';
import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { initOnboard, initNotify } from './config';

import { walletAddressState, networkIdState } from 'store/connection';

const useConnector = () => {
	// TODO: detect networkId
	const [networkId, setNetworkId] = useRecoilState(networkIdState);
	const [provider, setProvider] = useState<ethers.providers.Provider>(
		ethers.getDefaultProvider(networkId)
	);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);

	const setWalletAddress = useSetRecoilState(walletAddressState);

	useEffect(() => {
		const onboard = initOnboard(networkId, {
			address: setWalletAddress,
			network: (networkId: number) => {
				// @ts-ignore
				if (SUPPORTED_NETWORKS[networkId]) {
					setNetworkId(networkId);
					onboard.config({ networkId });
					notify.config({ networkId });
				} else {
					console.log(`unsupported networkId - ${networkId}`);
				}
			},
			wallet: async (wallet: OnboardWallet) => {
				if (wallet.provider) {
					const provider = new ethers.providers.Web3Provider(wallet.provider);
					const network = await provider.getNetwork();

					setProvider(provider);
					setNetworkId(network.chainId as NetworkIds);
					setSigner(provider.getSigner());
				} else {
					setProvider(ethers.getDefaultProvider(networkId));
					setSigner(null);
					setWalletAddress(null);
				}
			},
		});
		const notify = initNotify(networkId);

		setOnboard(onboard);
		setNotify(notify);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		provider,
		signer,
		onboard,
		notify,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';

import { ethers } from 'ethers';
import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { NetworkId } from 'constants/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';

import { initOnboard, initNotify } from './config';

import { walletAddressState, networkIdState } from 'store/connection';

const useConnector = () => {
	const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);
	const setWalletAddress = useSetRecoilState(walletAddressState);
	const [networkId, setNetworkId] = useRecoilState(networkIdState);

	const setDefaults = () => {
		setProvider(null);
		setNetworkId(DEFAULT_NETWORK_ID);
		setWalletAddress(null);
	};

	useEffect(() => {
		const onboard = initOnboard(networkId, {
			address: setWalletAddress,
			network: (_networkId: number) => {
				// check for valid networkId
				const networkId = _networkId as NetworkId;
				setNetworkId(networkId);
				onboard.config({ networkId });
				notify.config({ networkId });
			},
			wallet: async (wallet: OnboardWallet) => {
				if (wallet.provider) {
					const provider = new ethers.providers.Web3Provider(wallet.provider);
					const network = await provider.getNetwork();
					setProvider(provider);
					setNetworkId(network.chainId as NetworkId);
					setSigner(provider.getSigner());
				} else {
					setDefaults();
				}
			},
		});
		const notify = initNotify(networkId);

		setOnboard(onboard);
		setNotify(notify);
		// eslint-disable-next-line
	}, []);

	// const connectWallet = async () => {
	// 	try {
	// 		if (onboard) {
	// 			await onboard.walletSelect();
	// 			await onboard.walletCheck();
	// 		}
	// 	} catch (e) {
	// 		console.log(e);
	// 		setError(e);
	// 	}

	// 	setOnboard(onboard);
	// };

	return {
		provider,
		signer,
		onboard,
		notify,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

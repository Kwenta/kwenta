import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';
import snxJSLib, { NetworkIds } from '@synthetixio/js';

import { ethers } from 'ethers';
import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { initOnboard, initNotify } from './config';

import { walletAddressState, networkIdState } from 'store/connection';

const useConnector = () => {
	const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);
	const setWalletAddress = useSetRecoilState(walletAddressState);
	const [networkId, setNetworkId] = useRecoilState(networkIdState);
	const [snxJS, setSnxJS] = useState<ReturnType<typeof snxJSLib>>(snxJSLib({ networkId }));

	useEffect(() => {
		const onboard = initOnboard(networkId, {
			address: setWalletAddress,
			network: (_networkId: number) => {
				// check for valid networkId
				const networkId = _networkId as NetworkIds;
				setNetworkId(networkId);
				onboard.config({ networkId });
				notify.config({ networkId });
			},
			wallet: async (wallet: OnboardWallet) => {
				if (wallet.provider) {
					const provider = new ethers.providers.Web3Provider(wallet.provider);
					const network = await provider.getNetwork();
					setProvider(provider);
					setNetworkId(network.chainId as NetworkIds);
					setSigner(provider.getSigner());
				} else {
					setProvider(null);
					setSigner(null);
					setWalletAddress(null);
				}
			},
		});
		const notify = initNotify(networkId);

		setOnboard(onboard);
		setNotify(notify);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (signer) {
			setSnxJS(snxJSLib({ networkId, signer }));
		}
	}, [signer, networkId]);

	return {
		provider,
		signer,
		onboard,
		notify,
		snxJS,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { NetworkId, Network as NetworkName /*SUPPORTED_NETWORKS*/ } from '@synthetixio/js';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { getDefaultNetworkId } from 'utils/network';

import { appReadyState } from 'store/app';
import { walletAddressState, networkState } from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { useLocalStorage } from 'hooks/useLocalStorage';

import { initOnboard, initNotify } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const setWalletAddress = useSetRecoilState(walletAddressState);

	const [selectedWallet, setSelectedWallet] = useLocalStorage(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

	useEffect(() => {
		const init = async () => {
			const networkId = await getDefaultNetworkId();
			// @ts-ignore
			const provider = ethers.getDefaultProvider(networkId);
			synthetix.setContractSettings({
				networkId,
				provider,
			});

			setNetwork({
				id: networkId,
				name: synthetix.js!.currentNetwork,
			});
			setProvider(provider);
			setAppReady(true);
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isAppReady && network) {
			const onboard = initOnboard(network, {
				address: setWalletAddress,
				network: (nextNetworkId: number) => {
					if (nextNetworkId !== network.id) {
						window.location.reload();
					}
					// TODO: currently, network change doesn't work well, may need to reload the page.
					/*
					// @ts-ignore
					if (SUPPORTED_NETWORKS[networkId]) {
						synthetix.setContractSettings({
							networkId,
							provider: provider!,
							signer: signer ?? undefined,
						});
						onboard.config({ networkId });
						notify.config({ networkId });
						setNetworkId(networkId);
					} else {
						console.log(`unsupported networkId - ${networkId}`);
					}
					*/
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = new ethers.providers.Web3Provider(wallet.provider);
						const signer = provider.getSigner();
						const network = await provider.getNetwork();
						const networkId = network.chainId as NetworkId;

						synthetix.setContractSettings({
							networkId,
							provider,
							signer,
						});
						setProvider(provider);
						setSigner(provider.getSigner());
						setNetwork({
							id: networkId,
							name: network.name as NetworkName,
						});
						setSelectedWallet(wallet.name);
					} else {
						// @ts-ignore
						setProvider(ethers.getDefaultProvider(networkId));
						setSigner(null);
						setWalletAddress(null);
					}
				},
			});
			const notify = initNotify(network);

			setOnboard(onboard);
			setNotify(notify);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet]);

	return {
		provider,
		signer,
		onboard,
		notify,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

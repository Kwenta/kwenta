import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { NetworkId /*SUPPORTED_NETWORKS*/ } from '@synthetixio/js';
import { ethers } from 'ethers';

import snxContracts from 'lib/snxContracts';

import { getDefaultNetworkId } from 'utils/network';

import { appReadyState } from 'store/app';
import { walletAddressState, networkIdState } from 'store/connection';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import { useLocalStorage } from 'hooks/useLocalStorage';

import { initOnboard, initNotify } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const useConnector = () => {
	const [networkId, setNetworkId] = useRecoilState(networkIdState);
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
			snxContracts.setContractSettings({
				networkId,
				provider,
			});

			setNetworkId(networkId);
			setProvider(provider);
			setAppReady(true);
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isAppReady) {
			const onboard = initOnboard(networkId, {
				address: setWalletAddress,
				network: (nextNetworkId: number) => {
					if (nextNetworkId !== networkId) {
						window.location.reload();
					}
					// TODO: currently, network change doesn't work well, may need to reload the page.
					/*
					// @ts-ignore
					if (SUPPORTED_NETWORKS[networkId]) {
						snxContracts.setContractSettings({
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

						snxContracts.setContractSettings({
							networkId,
							provider,
							signer,
						});
						setProvider(provider);
						setSigner(provider.getSigner());
						setNetworkId(networkId);
						setSelectedWallet(wallet.name);
					} else {
						// @ts-ignore
						setProvider(ethers.getDefaultProvider(networkId));
						setSigner(null);
						setWalletAddress(null);
					}
				},
			});
			const notify = initNotify(networkId);

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

import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { NetworkId, Network as NetworkName } from '@synthetixio/contracts-interface';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { getDefaultNetworkId, getIsOVM } from 'utils/network';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState } from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

import { initOnboard } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);
	const [
		transactionNotifier,
		setTransactionNotifier,
	] = useState<TransactionNotifierInterface | null>(null);

	useEffect(() => {
		const init = async () => {
			// TODO: need to verify we support the network
			const networkId = await getDefaultNetworkId();

			const provider = loadProvider({
				networkId,
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				provider: window.ethereum,
			});
			const useOvm = getIsOVM(networkId);

			synthetix.setContractSettings({
				networkId,
				provider,
				useOvm,
			});

			// @ts-ignore
			setNetwork({ ...synthetix.js?.network, useOvm });
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
				network: (networkId: number) => {
					const isSupportedNetwork =
						synthetix.chainIdToNetwork != null && synthetix.chainIdToNetwork[networkId as NetworkId]
							? true
							: false;

					if (isSupportedNetwork) {
						const provider = loadProvider({
							provider: onboard.getState().wallet.provider,
						});
						const signer = provider.getSigner();
						const useOvm = getIsOVM(networkId);

						synthetix.setContractSettings({
							networkId,
							provider,
							signer,
							useOvm,
						});
						onboard.config({ networkId });
						if (transactionNotifier) {
							transactionNotifier.setProvider(provider);
						} else {
							setTransactionNotifier(new TransactionNotifier(provider));
						}
						setProvider(provider);
						setSigner(signer);
						setNetwork({
							id: networkId,
							// @ts-ignore
							name: synthetix.chainIdToNetwork[networkId],
							useOvm,
						});
					}
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = loadProvider({ provider: wallet.provider });
						const network = await provider.getNetwork();
						const networkId = network.chainId as NetworkId;
						const useOvm = getIsOVM(networkId);

						synthetix.setContractSettings({
							networkId,
							provider,
							signer: provider.getSigner(),
							useOvm,
						});
						setProvider(provider);
						setSigner(provider.getSigner());
						setNetwork({
							id: networkId,
							name: network.name as NetworkName,
							useOvm,
						});
						setSelectedWallet(wallet.name);
						setTransactionNotifier(new TransactionNotifier(provider));
						setTransactionNotifier(new TransactionNotifier(provider));
					} else {
						// TODO: setting provider to null might cause issues, perhaps use a default provider?
						// setProvider(null);
						setSigner(null);
						setWalletAddress(null);
						setSelectedWallet(null);
					}
				},
			});

			setOnboard(onboard);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet && !walletAddress) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet, walletAddress]);

	const resetCachedUI = () => {
		// TODO: since orders are not persisted, we need to reset them.
		setOrders([]);
		setHasOrdersNotification(false);
	};

	const connectWallet = async () => {
		try {
			if (onboard) {
				onboard.walletReset();
				const success = await onboard.walletSelect();
				if (success) {
					await onboard.walletCheck();
					resetCachedUI();
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	const disconnectWallet = async () => {
		try {
			if (onboard) {
				onboard.walletReset();
				resetCachedUI();
			}
		} catch (e) {
			console.log(e);
		}
	};

	const switchAccounts = async () => {
		try {
			if (onboard) {
				onboard.accountSelect();
			}
		} catch (e) {
			console.log(e);
		}
	};

	const isHardwareWallet = () => {
		if (onboard) {
			const onboardState = onboard.getState();
			if (onboardState.address != null) {
				return onboardState.wallet.type === 'hardware';
			}
		}
		return false;
	};

	const getTokenAddress = (currencyKey: CurrencyKey) => {
		const { contracts } = synthetix.js!;

		return currencyKey === CRYPTO_CURRENCY_MAP.ETH
			? ETH_ADDRESS
			: contracts[synthToContractName(currencyKey!)].address;
	};

	return {
		provider,
		signer,
		onboard,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		transactionNotifier,
		getTokenAddress,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

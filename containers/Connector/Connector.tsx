import { NetworkId, SynthetixJS, synthetix, NetworkName } from '@synthetixio/contracts-interface';
import { loadProvider } from '@synthetixio/providers';
import { getOptimismProvider } from '@synthetixio/providers';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';
import { ethers } from 'ethers';
import { invert, keyBy } from 'lodash';
import { useState, useEffect } from 'react';
import { useMemo } from 'react';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { createContainer } from 'unstated-next';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import { appReadyState } from 'store/app';
import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { walletAddressState, networkState, isWalletConnectedState } from 'store/wallet';
import { synthToContractName } from 'utils/currencies';
import {
	getDefaultNetworkId,
	getDefaultProvider,
	getIsOVM,
	isSupportedNetworkId,
} from 'utils/network';

import { initOnboard } from './config';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
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

	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();
	const defaultSynthetixjs = synthetix({
		provider: getOptimismProvider({ networkId: DEFAULT_NETWORK_ID }),
		networkId: DEFAULT_NETWORK_ID,
		useOvm: true,
	});

	const [synthsMap, tokensMap, chainIdToNetwork] = useMemo(() => {
		if (synthetixjs == null) {
			return [{}, {}, {}];
		}

		return [
			keyBy(synthetixjs.synths, 'name'),
			keyBy(synthetixjs.tokens, 'symbol'),
			invert(synthetixjs.networkToChainId),
		];
	}, [synthetixjs]);

	useEffect(() => {
		const init = async () => {
			// TODO: need to verify we support the network
			const networkId = await getDefaultNetworkId(isWalletConnected);
			const defaultProvider = getDefaultProvider(networkId);

			const provider = isWalletConnected
				? loadProvider({
						networkId,
						infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
						provider: window.ethereum,
				  })
				: defaultProvider;

			const useOvm = getIsOVM(Number(networkId));

			const snxjs = synthetix({ provider, networkId, useOvm });

			// @ts-ignore
			setNetwork(snxjs.network, useOvm);
			setSynthetixjs(snxjs);
			setProvider(provider);
			setAppReady(true);
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isAppReady && network) {
			const onboard = initOnboard(network, {
				address: (address) => {
					if (address) {
						setWalletAddress(address);
					}
				},
				network: (networkId: number) => {
					if (isSupportedNetworkId(networkId as NetworkId)) {
						const provider = loadProvider({
							provider: onboard.getState().wallet.provider,
						});
						const signer = provider.getSigner();
						const useOvm = getIsOVM(networkId);

						const snxjs = synthetix({
							provider,
							networkId: networkId as NetworkId,
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
						setSynthetixjs(snxjs);
						setSigner(signer);
						setNetwork({
							id: networkId as NetworkId,
							// @ts-ignore
							name: chainIdToNetwork[networkId] as NetworkName,
							useOvm,
						});
					} else {
						setNetwork({
							id: networkId as NetworkId,
							name: chainIdToNetwork[networkId] as NetworkName,
						});
					}
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = loadProvider({ provider: wallet.provider });
						const network = await provider.getNetwork();
						const networkId = network.chainId as NetworkId;

						if (isSupportedNetworkId(networkId as NetworkId)) {
							const useOvm = getIsOVM(Number(networkId));

							const snxjs = synthetix({
								provider,
								networkId,
								signer: provider.getSigner(),
								useOvm,
							});

							setProvider(provider);
							setSigner(provider.getSigner());
							setSynthetixjs(snxjs);
							setNetwork({
								id: networkId,
								name: network.name,
								useOvm,
							});
						} else {
							setNetwork({
								id: networkId as NetworkId,
								name: network.name as NetworkName,
							});
						}

						if (!isIFrame()) setSelectedWallet(wallet.name); // don't allow iframed kwenta to override localstorage
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
		// disables caching if in IFrame allow parent to set wallet address
		if (onboard && selectedWallet && !walletAddress && !isIFrame()) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet, walletAddress]);

	const isIFrame = () => {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	};

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
		if (synthetixjs == null) {
			return null;
		}

		return currencyKey === CRYPTO_CURRENCY_MAP.ETH
			? ETH_ADDRESS
			: synthetixjs!.contracts[synthToContractName(currencyKey!)].address;
	};

	return {
		network,
		provider,
		signer,
		synthetixjs,
		synthsMap,
		tokensMap,
		onboard,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		transactionNotifier,
		getTokenAddress,
		staticMainnetProvider,
		defaultSynthetixjs,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

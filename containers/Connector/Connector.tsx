import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM, isSupportedNetworkId } from 'utils/network';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { NetworkId, SynthetixJS, synthetix, NetworkName } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState, isWalletConnectedState, Network } from 'store/wallet';

import { OnboardAPI, WalletState } from '@web3-onboard/core';
import { useConnectWallet } from '@web3-onboard/react';
import { initOnboard, WEB3ONBOARD_SUPPORTED_NETWORKS, formatChain } from './config';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { invert, keyBy } from 'lodash';
import { useMemo } from 'react';
import { INFURA_SUPPORTED_NETWORKS } from 'utils/infura';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);

	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [, setWalletAddress] = useRecoilState(walletAddressState);

	const [onboard, setOnboard] = useState<OnboardAPI | null>(null);
	const [{ wallet }] = useConnectWallet();

	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const [
		transactionNotifier,
		setTransactionNotifier,
	] = useState<TransactionNotifierInterface | null>(null);

	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();

	const [synthsMap, tokensMap] = useMemo(() => {
		if (synthetixjs == null) {
			return [{}, {}, {}];
		}

		return [
			keyBy(synthetixjs.synths, 'name'),
			keyBy(synthetixjs.tokens, 'symbol'),
			invert(synthetixjs.networkToChainId),
		];
	}, [synthetixjs]);

	// Initialize web3-onboard and bnc-notify
	useEffect(() => {
		if (isAppReady && network) {
			setOnboard(initOnboard);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady, network]);

	useEffect(() => {
		initWalletState();
		setAppReady(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Connect automatically to the first previously connected wallet
	useEffect(() => {
		const localStorage = window.localStorage.getItem('connectedWallets');
		const previouslyConnectedWallets = JSON.parse(localStorage!);
		if (previouslyConnectedWallets?.length) {
			async function setWalletFromLocalStorage() {
				if (onboard) {
					// Connect to the first previously connected wallet
					const [primaryWallet] = await onboard.connectWallet({
						autoSelect: previouslyConnectedWallets[0],
					});

					// Update the app (state and ui)
					updateWalletState(primaryWallet);
					resetCachedUI();
				}
			}
			setWalletFromLocalStorage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const web3OnboardChainIdToNetwork = (id: string): Network | null => {
		// Remove the 0x prefix from the chain id
		const web3OnboardChainId = id.split('0x')[1];

		// Find the infura chain id equivalent to the web3-onboard chain id
		const infuraChaindIdStr = (Object.keys(WEB3ONBOARD_SUPPORTED_NETWORKS) as Array<string>).find(
			(k) => WEB3ONBOARD_SUPPORTED_NETWORKS[k] === web3OnboardChainId
		);
		if (infuraChaindIdStr) {
			// Return a Network object corresponding to the web3-onboard chain id
			const chainId = +infuraChaindIdStr as NetworkId;
			const chainName = INFURA_SUPPORTED_NETWORKS[chainId] as NetworkName;
			return {
				id: chainId,
				name: chainName,
			};
		}

		// If the web3-onboard is not equivalent to any infura chain id, return null
		console.log("Can't find an equivalent for this web3-onboard chain id:", id);
		return null;
	};

	const initWalletState = async () => {
		// TODO: need to verify we support the network
		const networkId = await getDefaultNetworkId(isWalletConnected);
		const provider = loadProvider({
			networkId,
			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
			provider: isWalletConnected ? window.ethereum : undefined,
		});
		const useOvm = getIsOVM(Number(networkId));
		const snxjs = synthetix({ provider, networkId, useOvm });

		// @ts-ignore
		setNetwork(snxjs.network, useOvm);
		setProvider(provider);
		setSynthetixjs(snxjs);
	};

	const updateWalletState = (primaryWallet: WalletState) => {
		// Update the wallet state
		setWalletAddress(primaryWallet.accounts[0].address);

		// Update network, provider, signer and synthetixjs states
		const chainId = primaryWallet.chains[0].id;
		const newNetwork = web3OnboardChainIdToNetwork(chainId);
		if (newNetwork) {
			if (isSupportedNetworkId(newNetwork.id as NetworkId)) {
				const provider = loadProvider({
					newNetwork,
					infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
					provider: primaryWallet.provider,
				});
				const signer = provider.getSigner();
				const useOvm = getIsOVM(newNetwork.id);
				const snxjs = synthetix({
					provider,
					networkId: newNetwork.id,
					signer,
					useOvm,
				});

				// @ts-ignore
				setNetwork(newNetwork, useOvm);
				setProvider(provider);
				setSigner(signer);
				setSynthetixjs(snxjs);

				if (transactionNotifier) {
					transactionNotifier.setProvider(provider);
				} else {
					setTransactionNotifier(new TransactionNotifier(provider));
				}
			}
		}
	};

	const resetCachedUI = () => {
		// TODO: since orders are not persisted, we need to reset them.
		setOrders([]);
		setHasOrdersNotification(false);
	};

	const connectWallet = async () => {
		if (onboard) {
			// Connect to any wallet
			const [primaryWallet] = await onboard.connectWallet();

			// Update the app (state and ui)
			updateWalletState(primaryWallet);
			resetCachedUI();
		}
	};

	const disconnectWallet = async () => {
		if (onboard) {
			// Disconnect from the last wallet used
			const [primaryWallet] = onboard.state.get().wallets;
			await onboard.disconnectWallet({ label: primaryWallet.label });

			// Update the app (state and ui)
			setWalletAddress(null);
			resetCachedUI();
		}
	};

	const switchAccounts = async () => {
		await connectWallet();
	};

	const switchToChain = async (newNetwork: Network) => {
		if (onboard) {
			const success = await onboard.setChain({ chainId: formatChain(newNetwork.id) });

			if (success) {
				// Update the app state
				if (isSupportedNetworkId(newNetwork.id as NetworkId)) {
					const provider = loadProvider({
						newNetwork,
						infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
						provider: wallet?.provider,
					});
					const signer = provider.getSigner();
					const useOvm = getIsOVM(newNetwork.id);
					const snxjs = synthetix({
						provider,
						networkId: newNetwork.id,
						signer,
						useOvm,
					});

					console.log('SWITCHING to', newNetwork, useOvm, provider, signer, useOvm); // TODO: remove

					// @ts-ignore
					setNetwork(newNetwork, useOvm);
					setProvider(provider);
					setSigner(signer);
					setSynthetixjs(snxjs);

					if (transactionNotifier) {
						transactionNotifier.setProvider(provider);
					} else {
						setTransactionNotifier(new TransactionNotifier(provider));
					}
				}

				// Update the ui.
				resetCachedUI();
			}
		}
	};

	const isHardwareWallet = () => {
		return wallet?.label === 'trezor' || wallet?.label === 'ledger';
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
		switchToChain,
		isHardwareWallet,
		transactionNotifier,
		getTokenAddress,
		staticMainnetProvider,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

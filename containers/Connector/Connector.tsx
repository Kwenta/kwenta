import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM, isSupportedNetworkId } from 'utils/network';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import { NetworkId, SynthetixJS, synthetix } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState, isWalletConnectedState } from 'store/wallet';

import { OnboardAPI } from '@web3-onboard/core';
import { useConnectWallet } from '@web3-onboard/react';
import { initOnboard, NETWORK_TO_WEB3_ONBOARD, WEB3_ONBOARD_TO_NETWORK } from './config';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { invert, keyBy } from 'lodash';
import { useMemo } from 'react';

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
					const walletAddress = primaryWallet.accounts[0].address;
					setWalletAddress(walletAddress);
					updateNetworkState(primaryWallet.chains[0].id, walletAddress);
					resetCachedUI();
				}
			}
			setWalletFromLocalStorage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	// Update network, provider, signer and synthetixjs states
	const updateNetworkState = (chainId: string, wallet: any) => {
		if (wallet) {
			const newNetwork = WEB3_ONBOARD_TO_NETWORK[chainId];
			const networkId = newNetwork.id;
			if (isSupportedNetworkId(networkId as NetworkId)) {
				const provider = loadProvider({
					networkId,
					infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
					provider: window.ethereum,
				});
				const signer = provider.getSigner();
				const useOvm = getIsOVM(networkId);
				const snxjs = synthetix({
					provider,
					networkId,
					signer,
					useOvm,
				});

				// @ts-ignore
				setNetwork(newNetwork);
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

			// Update the app (wallet and network states and ui)
			const walletAddress = primaryWallet.accounts[0].address;
			setWalletAddress(walletAddress);
			updateNetworkState(primaryWallet.chains[0].id, walletAddress);
			resetCachedUI();
		}
	};

	const disconnectWallet = async () => {
		if (onboard) {
			// Disconnect from the last wallet used
			const [primaryWallet] = onboard.state.get().wallets;
			await onboard.disconnectWallet({ label: primaryWallet.label });

			// Update the app (wallet state and ui)
			setWalletAddress(null);
			resetCachedUI();
		}
	};

	const switchAccounts = async () => {
		await connectWallet();
	};

	const switchToChain = async (chainId: string) => {
		if (onboard) {
			const success = await onboard.setChain({ chainId });

			if (success) {
				// Update the app (network state and ui)
				updateNetworkState(chainId, wallet);
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

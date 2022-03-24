import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { TransactionNotifierInterface } from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM } from 'utils/network';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { SynthetixJS, synthetix } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState } from 'store/app';
import { networkState } from 'store/wallet';

import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { invert, keyBy } from 'lodash';
import { useMemo } from 'react';

import { OnboardAPI } from '@web3-onboard/core';
import { useConnectWallet, useWallets } from '@web3-onboard/react';
import { initWeb3Onboard } from './config';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);

	const [{ wallet }, connect, disconnect] = useConnectWallet();
	const connectedWallets = useWallets();
	const [web3Onboard, setWeb3Onboard] = useState<OnboardAPI | null>(null);

	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const [transactionNotifier] = useState<TransactionNotifierInterface | null>(null);

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

	useEffect(() => {
		const init = async () => {
			// TODO: need to verify we support the network
			const networkId = await getDefaultNetworkId();
			const provider = loadProvider({
				networkId,
				infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				provider: window.ethereum,
			});
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

	// Initialize the web3 onboard modal.
	useEffect(() => {
		if (isAppReady && network) {
			setWeb3Onboard(initWeb3Onboard);
		}
	}, [isAppReady, network]);

	// Store previsouly connected wallets in the storage.
	useEffect(() => {
		if (!connectedWallets.length) return;
		const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label);
		window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsLabelArray));
	}, [connectedWallets]);

	// Connect automatically to the first previously connected wallet.
	useEffect(() => {
		const previouslyConnectedWalletsJSON = window.localStorage.getItem('connectedWallets');
		if (previouslyConnectedWalletsJSON) {
			const previouslyConnectedWallets = JSON.parse(previouslyConnectedWalletsJSON);
			if (previouslyConnectedWallets?.length) {
				async function setWalletFromLocalStorage() {
					await connect({ autoSelect: previouslyConnectedWallets[0] });
				}

				setWalletFromLocalStorage();
			}
		}
	}, [web3Onboard, connect]);

	const resetCachedUI = () => {
		// TODO: since orders are not persisted, we need to reset them.
		setOrders([]);
		setHasOrdersNotification(false);
	};

	const connectWallet = async () => {
		try {
			const success = await connect({});
			if (success !== null) {
				resetCachedUI();
			}
		} catch (e) {
			console.log(e);
		}
	};

	const disconnectWallet = async () => {
		try {
			if (wallet) {
				const success = await disconnect(wallet);
				if (success !== null) {
					resetCachedUI();

					// Update the list of connected wallets stored in the storage.
					const connectedWalletsList = connectedWallets.map(({ label }) => label);
					window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsList));
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	const isHardwareWallet = () => {
		// TODO: Implement this once the feature is available.
		// https://github.com/blocknative/web3-onboard/issues/897
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
		web3Onboard,
		connectWallet,
		disconnectWallet,
		isHardwareWallet,
		transactionNotifier,
		getTokenAddress,
		staticMainnetProvider,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';
import { loadProvider } from '@synthetixio/providers';

import { getDefaultNetworkId, getIsOVM, isSupportedNetworkId } from 'utils/network';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import {
	NetworkId,
	SynthetixJS,
	synthetix,
	NetworkName,
	NetworkNameById,
} from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState } from 'store/app';
import { walletAddressState, networkState, isWalletConnectedState } from 'store/wallet';

import useLocalStorage from 'hooks/useLocalStorage';

import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { invert, keyBy } from 'lodash';
import { useMemo } from 'react';

import {
	useNetwork,
	useAccount,
	useProvider,
	useSigner,
	useConnect,
	useDisconnect,
	useWebSocketProvider,
	Connector as WagmiConnector,
	useClient,
} from 'wagmi';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	// const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const [wallet, setWallet] = useState<WagmiConnector | null>(null);
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

	const client = useClient();
	// console.log(client.connectors);
	// const wagmiSigner = useSigner();
	// const { data, isError, isLoading } = useAccount()
	// const {
	// 	activeChain,
	// 	  chains,
	// 	  error,
	// 	  isLoading,
	// 	  pendingChainId,
	// 	  switchNetwork,
	// } = useNetwork();
	// const wagmiProvider = useProvider();
	// const wagmiWebSocketProvider = useWebSocketProvider({
	// 	chainId: 1,
	// });
	// const wagmiProvider = useProvider();
	// const wagmiWebSocketProvider = useWebSocketProvider();

	// const { activeConnector, connect, reset, connectors, error } = useConnect();

	// onSettled(data, error) {
	// 	console.log('Settled onConnect', { data, error });
	// },
	// onError(error) {
	// 	console.log('Error onConnect', error);
	// },

	const { disconnect } = useDisconnect({
		onSuccess(data) {
			console.log('Success Disconnect', data);
		},
		onSettled(data, error) {
			console.log('Settled Disconnect', { data, error });
		},
		onError(error) {
			console.log('Error Disconnect', error);
		},
	});

	const wagmiSigner = useSigner({
		onSuccess(data) {
			setSigner(data);
			console.log('Success Signer', signer);
		},
		onSettled(data, error) {
			console.log('Settled Signer', { data, error });
		},
		onError(error) {
			console.log('Error Signer', error);
		},
	});

	const wagmiAccount = useAccount({
		onSuccess(data) {
			setWalletAddress(data?.address || '');
			console.log('Success Account', walletAddress);
		},
		onSettled(data, error) {
			console.log('Settled Account', { data, error });
		},
		onError(error) {
			console.log('Error Account', error);
		},
	});

	const wagmiNetwork = useNetwork({
		onSuccess(data) {
			console.log(data);
			const id = Number(data.id) as NetworkId;
			const networkName = NetworkNameById[id];
			setNetwork({
				id,
				name: networkName,
				useOvm: getIsOVM(id),
			});
			console.log('Success', network);
		},
		onSettled(data, error) {
			console.log('Settled', { data, error });
		},
		onError(error) {
			console.log('Error', error);
		},
	});

	const { activeConnector, connect, reset, connectors, error } = useConnect();
	// const { disconnect } = useDisconnect();
	const { data } = useSigner();
	// const { accountData } = useAccount();
	const { activeChain, chains, pendingChainId, switchNetwork } = useNetwork();
	const wagmiProvider = useProvider();
	const wagmiWebSocketProvider = useWebSocketProvider();

	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();

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

	// setNetwork
	// setSelectedWallet
	// setWalletAddress
	// setProvider
	// setSigner
	useEffect(() => {
		const init = async () => {
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
			setSynthetixjs(snxjs);
			setProvider(provider);
			setAppReady(true);
		};

		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (isAppReady && network) {
			const loadConnection = async () => {
				console.log(wagmiNetwork);
				const networkId = wagmiNetwork.activeChain?.id as NetworkId;
				const provider = loadProvider({
					networkId,
					infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
				});
				// const network = await provider.getNetwork();
				// const networkId = network.chainId as NetworkId;
				// const signerData = await provider.getSigner();
				if (isSupportedNetworkId(networkId as NetworkId)) {
					const useOvm = getIsOVM(Number(networkId));
					const snxjs = synthetix({
						provider,
						networkId,
						signer: wagmiSigner?.data || undefined,
						useOvm,
					});
					setProvider(provider);
					setSigner(wagmiSigner?.data || null);
					setSynthetixjs(snxjs);
					setNetwork({
						id: networkId,
						name: chainIdToNetwork[networkId] as NetworkName,
						useOvm,
					});
				} else {
					setNetwork({
						id: networkId as NetworkId,
						name: chainIdToNetwork[networkId] as NetworkName,
					});
				}
			};
			loadConnection();
			// setWalletAddress(await wagmiAccount?.address || '');
			//   wallet: async (wallet: OnboardWallet) => {
			//     if (wallet.provider) {
			//       const provider = loadProvider({ provider: wallet.provider });
			//       const network = await provider.getNetwork();
			//       const networkId = network.chainId as NetworkId;
			//       if (isSupportedNetworkId(networkId as NetworkId)) {
			//         const useOvm = getIsOVM(Number(networkId));
			//         const snxjs = synthetix({
			//           provider,
			//           networkId,
			//           signer: provider.getSigner(),
			//           useOvm,
			//         });
			//         setProvider(provider);
			//         setSigner(provider.getSigner());
			//         setSynthetixjs(snxjs);
			//         setNetwork({
			//           id: networkId,
			//           name: network.name,
			//           useOvm,
			//         });
			//       } else {
			//         setNetwork({
			//           id: networkId as NetworkId,
			//           name: network.name as NetworkName,
			//         });
			//       }
			//       if (!isIFrame()) setSelectedWallet(wallet.name); // don't allow iframed kwenta to override localstorage
			//       setTransactionNotifier(new TransactionNotifier(provider));
			//     } else {
			//       // TODO: setting provider to null might cause issues, perhaps use a default provider?
			//       // setProvider(null);
			//       setSigner(null);
			//       setWalletAddress(null);
			//       setSelectedWallet(null);
			//     }
			// const onboard = initOnboard(network, {
			// 	address: (address) => {
			// 		if (address) {
			// 			setWalletAddress(address);
			// 		}
			// 	},
			// network: (networkId: number) => {
			// 	if (isSupportedNetworkId(networkId as NetworkId)) {
			// 		const provider = loadProvider({
			// 			provider: onboard.getState().wallet.provider,
			// 		});
			// 		const signer = provider.getSigner();
			// 		const useOvm = getIsOVM(networkId);
			// 		const snxjs = synthetix({
			// 			provider,
			// 			networkId: networkId as NetworkId,
			// 			signer,
			// 			useOvm,
			// 		});
			// 		onboard.config({ networkId });
			// 		if (transactionNotifier) {
			// 			transactionNotifier.setProvider(provider);
			// 		} else {
			// 			setTransactionNotifier(new TransactionNotifier(provider));
			// 		}
			// 		setProvider(provider);
			// 		setSynthetixjs(snxjs);
			// 		setSigner(signer);
			// 		setNetwork({
			// 			id: networkId as NetworkId,
			// 			// @ts-ignore
			// 			name: chainIdToNetwork[networkId] as NetworkName,
			// 			useOvm,
			// 		});
			// 	} else {
			// 		setNetwork({
			// 			id: networkId as NetworkId,
			// 			name: chainIdToNetwork[networkId] as NetworkName,
			// 		});
			// 	}
			// },
			// 		wallet: async (wallet: OnboardWallet) => {
			// 			if (wallet.provider) {
			// 				const provider = loadProvider({ provider: wallet.provider });
			// 				const network = await provider.getNetwork();
			// 				const networkId = network.chainId as NetworkId;
			// 				if (isSupportedNetworkId(networkId as NetworkId)) {
			// 					const useOvm = getIsOVM(Number(networkId));
			// 					const snxjs = synthetix({
			// 						provider,
			// 						networkId,
			// 						signer: provider.getSigner(),
			// 						useOvm,
			// 					});
			// 					setProvider(provider);
			// 					setSigner(provider.getSigner());
			// 					setSynthetixjs(snxjs);
			// 					setNetwork({
			// 						id: networkId,
			// 						name: network.name,
			// 						useOvm,
			// 					});
			// 				} else {
			// 					setNetwork({
			// 						id: networkId as NetworkId,
			// 						name: network.name as NetworkName,
			// 					});
			// 				}
			// 				if (!isIFrame()) setSelectedWallet(wallet.name); // don't allow iframed kwenta to override localstorage
			// 				setTransactionNotifier(new TransactionNotifier(provider));
			// 			} else {
			// 				// TODO: setting provider to null might cause issues, perhaps use a default provider?
			// 				// setProvider(null);
			// 				setSigner(null);
			// 				setWalletAddress(null);
			// 				setSelectedWallet(null);
			// 			}
			// 		},
			// 	});
			// 	setOnboard(onboard);
		}
	}, [isAppReady, data]);
	// eslint-disable-next-line react-hooks/exhaustive-deps

	// load previously saved wallet
	// useEffect(() => {
	// 	// disables caching if in IFrame allow parent to set wallet address
	// 	if (onboard && selectedWallet && !walletAddress && !isIFrame()) {
	// 		onboard.walletSelect(selectedWallet);
	// 	}
	// }, [onboard, selectedWallet, walletAddress]);
	// console.log('stuff', wagmiSigner?.data, wagmiAccount?.data, wagmiNetwork);

	// console.log(
	// 	`activeConnector ${JSON.stringify(activeConnector)}`,
	// 	`wagmiSigner ${JSON.stringify(data)}`,
	// 	`wagmiAccount ${JSON.stringify(wagmiAccount?.data)}`,
	// 	`wagmiNetwork ${JSON.stringify(wagmiNetwork?.data)}`
	// );

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
			if (activeConnector) {
				reset();
				await connect(activeConnector);
				resetCachedUI();
				// if (success) {
				// 	await onboard.walletCheck();
				// 	resetCachedUI();
				// }
			}
		} catch (e) {
			console.log(e);
		}
	};

	const disconnectWallet = async () => {
		try {
			reset();
			disconnect();
			resetCachedUI();
		} catch (e) {
			console.log(e);
		}
	};

	// TODO switch accounts
	const switchAccounts = async () => {
		try {
			if (wagmiNetwork) {
				// return await wagmiNetwork?.switchNetwork(chainId);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const isHardwareWallet = () => {
		if (activeConnector) {
			return activeConnector?.id === 'ledger';
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
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		transactionNotifier,
		getTokenAddress,
		staticMainnetProvider,
		error,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

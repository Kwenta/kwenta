import { createContainer } from 'unstated-next';

import {
	NetworkId,
	SynthetixJS,
	synthetix,
	NetworkName,
	NetworkNameById,
	NetworkIdByName,
	CurrencyKey,
} from '@synthetixio/contracts-interface';

import { loadProvider } from '@synthetixio/providers';

import {
	TransactionNotifier,
	TransactionNotifierInterface,
} from '@synthetixio/transaction-notifier';

import {
	useNetwork,
	useAccount,
	useProvider,
	useSigner,
	useConnect,
	useDisconnect,
	useWebSocketProvider,
	Connector as WagmiConnector,
	useEnsAvatar,
	useEnsName,
} from 'wagmi';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ethers } from 'ethers';
import useLocalStorage from 'hooks/useLocalStorage';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { appReadyState } from 'store/app';
import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { networkState, isWalletConnectedState, walletAddressState } from 'store/wallet';
import { keyBy, invert } from 'lodash';
import { getIsOVM } from 'utils/network';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import {
	CRYPTO_CURRENCY_MAP,
	ETH_ADDRESS,
	synthToContractName,
} from '@synthetixio/queries/build/node/src/currency';

const useConnector = () => {
	const wagmiProvider = useProvider();
	const account = useAccount();
	const signerData = useSigner();
	const { activeConnector, connect, reset } = useConnect();
	const { activeChain, chains } = useNetwork();
	const { disconnect } = useDisconnect();

	const wagmiWebSocketProvider = useWebSocketProvider();
	const [network, setNetwork] = useRecoilState(networkState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(wagmiProvider);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const [wallet, setWallet] = useState<WagmiConnector | null>(activeConnector || null);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

	const ensName = useEnsName({
		address: walletAddress || undefined,
		chainId: 1,
		onError: (error) => {
			// do nothing
		},
	});

	const [
		transactionNotifier,
		setTransactionNotifier,
	] = useState<TransactionNotifierInterface | null>(null);

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

	useEffect(() => {
		if (account?.data) {
			setWalletAddress(account?.data?.address ?? null);
		}

		if (activeChain?.id && activeChain?.id !== network?.id) {
			const name = NetworkNameById[activeChain.id as NetworkId];

			setNetwork({
				id: NetworkIdByName[name],
				name,
				useOvm: getIsOVM(activeChain.id),
			});
			// if (activeChain.unsupported!) {
			// } else {
			// }

			if (signerData.data) {
				debugger;
			}
		}
	}, [account?.data, activeChain?.id, signerData?.data]);

	useEffect(() => {
		const init = async () => {
			// TODO: need to verify we support the network
			const networkId = (activeChain?.id || DEFAULT_NETWORK_ID) as NetworkId;
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
			} else {
				await disconnectWallet();
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
			if (activeChain?.id) {
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
		ensName,
		walletAddress,
		wallet,
		setNetwork,
		setProvider,
		setWalletAddress,
		setWallet,
		setSelectedWallet,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import {
	NetworkId,
	Network as NetworkName,
	SynthetixJS,
	synthetix,
} from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { getDefaultNetworkId } from 'utils/network';

import { ordersState } from 'store/orders';
import { hasOrdersNotificationState } from 'store/ui';
import { appReadyState, languageState } from 'store/app';
import { walletAddressState, networkState } from 'store/wallet';

import { Wallet as OnboardWallet } from 'bnc-onboard/dist/src/interfaces';

import useLocalStorage from 'hooks/useLocalStorage';

import { initOnboard, initNotify } from './config';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { CRYPTO_CURRENCY_MAP, CurrencyKey, ETH_ADDRESS } from 'constants/currency';
import { synthToContractName } from 'utils/currencies';
import { invert, keyBy } from 'lodash';
import { useMemo } from 'react';

const useConnector = () => {
	const [network, setNetwork] = useRecoilState(networkState);
	const language = useRecoilValue(languageState);
	const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);
	const [signer, setSigner] = useState<ethers.Signer | null>(null);
	const [synthetixjs, setSynthetixjs] = useState<SynthetixJS | null>(null);
	const [onboard, setOnboard] = useState<ReturnType<typeof initOnboard> | null>(null);
	const [notify, setNotify] = useState<ReturnType<typeof initNotify> | null>(null);
	const [isAppReady, setAppReady] = useRecoilState(appReadyState);
	const [walletAddress, setWalletAddress] = useRecoilState(walletAddressState);
	const setOrders = useSetRecoilState(ordersState);
	const setHasOrdersNotification = useSetRecoilState(hasOrdersNotificationState);
	const [selectedWallet, setSelectedWallet] = useLocalStorage<string | null>(
		LOCAL_STORAGE_KEYS.SELECTED_WALLET,
		''
	);

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
			const networkId = await getDefaultNetworkId();

			// @ts-ignore
			const provider = new ethers.providers.InfuraProvider(
				networkId,
				process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
			);

			const snxjs = synthetix({ provider, networkId });

			// @ts-ignore
			setNetwork(snxjs.network);
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
				address: setWalletAddress,
				network: (networkId: number) => {
					const isSupportedNetwork =
						chainIdToNetwork != null && chainIdToNetwork[networkId as NetworkId] ? true : false;

					if (isSupportedNetwork) {
						const provider = new ethers.providers.Web3Provider(onboard.getState().wallet.provider);
						const signer = provider.getSigner();

						const snxjs = synthetix({ provider, networkId, signer });

						onboard.config({ networkId });
						notify.config({ networkId });
						setProvider(provider);
						setSynthetixjs(snxjs);
						setSigner(signer);

						setNetwork({
							id: networkId as NetworkId,
							// @ts-ignore
							name: chainIdToNetwork[networkId] as NetworkName,
						});
					}
				},
				wallet: async (wallet: OnboardWallet) => {
					if (wallet.provider) {
						const provider = new ethers.providers.Web3Provider(wallet.provider);
						const signer = provider.getSigner();
						const network = await provider.getNetwork();
						const networkId = network.chainId as NetworkId;

						const snxjs = synthetix({ provider, networkId, signer });

						setProvider(provider);
						setSigner(provider.getSigner());
						setSynthetixjs(snxjs);
						setNetwork({
							id: networkId,
							name: network.name as NetworkName,
						});
						setSelectedWallet(wallet.name);
					} else {
						// TODO: setting provider to null might cause issues, perhaps use a default provider?
						// setProvider(null);
						setSigner(null);
						setWalletAddress(null);
						setSelectedWallet(null);
					}
				},
			});
			const notify = initNotify(network, {
				clientLocale: language,
			});

			setOnboard(onboard);
			setNotify(notify);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAppReady]);

	// load previously saved wallet
	useEffect(() => {
		if (onboard && selectedWallet && !walletAddress) {
			onboard.walletSelect(selectedWallet);
		}
	}, [onboard, selectedWallet, walletAddress]);

	useEffect(() => {
		if (notify) {
			notify.config({
				clientLocale: language,
			});
		}
	}, [language, notify]);

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
		notify,
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
		getTokenAddress,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

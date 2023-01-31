import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import { TransactionNotifier as BaseTN } from '@synthetixio/transaction-notifier';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useAccount, useNetwork, useSigner, useProvider } from 'wagmi';

import { sdk } from 'state/config';
import { useAppDispatch } from 'state/hooks';
import { resetNetwork, setSigner } from 'state/wallet/actions';

import { generateExplorerFunctions, getBaseUrl } from './blockExplorer';
import { activeChainIds, chain, wagmiClient } from './config';

export let transactionNotifier = new BaseTN(wagmiClient.provider);
export let blockExplorer = generateExplorerFunctions(getBaseUrl(10));

const useConnector = () => {
	const dispatch = useAppDispatch();
	const { chain: activeChain } = useNetwork();
	const { address, isConnected: isWalletConnected } = useAccount({
		onDisconnect: () => dispatch(setSigner(null)),
	});
	const [providerReady, setProviderReady] = useState(false);

	const network = useMemo(() => {
		return activeChainIds.includes(activeChain?.id ?? chain.optimism.id)
			? activeChain ?? chain.optimism
			: chain.optimism;
	}, [activeChain]);

	const walletAddress = useMemo(() => address ?? null, [address]);

	const provider = useProvider({ chainId: network.id });
	const l2Provider = useProvider({ chainId: chain.optimism.id });
	const { data: signer } = useSigner();

	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();

	const defaultSynthetixjs = useMemo(
		() => synthetix({ provider, networkId: network.id as NetworkId }),
		[provider, network.id]
	);

	const l2Synthetixjs = useMemo(
		() => synthetix({ provider: l2Provider, networkId: chain.optimism.id as NetworkId }),
		[l2Provider]
	);

	const handleNetworkChange = useCallback(
		(networkId: NetworkId) => {
			dispatch(resetNetwork(networkId));
			blockExplorer = generateExplorerFunctions(getBaseUrl(networkId));
		},
		[dispatch]
	);

	useEffect(() => {
		if (!!provider) {
			sdk.setProvider(provider).then((networkId) => {
				handleNetworkChange(networkId);
				setProviderReady(true);
			});
			transactionNotifier = new BaseTN(provider);
		}
	}, [provider, handleNetworkChange]);

	useEffect(() => {
		handleNetworkChange(network.id as NetworkId);
	}, [network.id, handleNetworkChange]);

	useEffect(() => {
		dispatch(setSigner(signer));
	}, [signer, dispatch]);

	const [synthsMap, tokensMap] = useMemo(() => {
		if (defaultSynthetixjs == null) return [{}, {}];

		return [keyBy(defaultSynthetixjs.synths, 'name'), keyBy(defaultSynthetixjs.tokens, 'symbol')];
	}, [defaultSynthetixjs]);

	const l2SynthsMap = useMemo(() => {
		if (l2Synthetixjs == null) return {};

		return keyBy(l2Synthetixjs.synths, 'name');
	}, [l2Synthetixjs]);

	return {
		activeChain,
		isWalletConnected,
		walletAddress,
		provider,
		l2Provider,
		signer,
		network,
		synthsMap,
		tokensMap,
		staticMainnetProvider,
		defaultSynthetixjs,
		l2SynthsMap,
		providerReady,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

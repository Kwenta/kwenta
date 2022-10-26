import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import { TransactionNotifier as BaseTN } from '@synthetixio/transaction-notifier';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import { sdk } from 'state/config';
import { useAppDispatch } from 'state/hooks';
import { resetNetwork, resetWalletAddress } from 'state/wallet/actions';
import { createContainer } from 'unstated-next';
import { chain, useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

import { generateExplorerFunctions, getBaseUrl } from './blockExplorer';
import { wagmiClient } from './config';

export let transactionNotifier = new BaseTN(wagmiClient.provider);
export let blockExplorer = generateExplorerFunctions(getBaseUrl(10));

const useConnector = () => {
	const { chain: activeChain } = useNetwork();
	const { address, isConnected: isWalletConnected } = useAccount();

	const unsupportedNetwork = useMemo(() => activeChain?.unsupported ?? false, [activeChain]);

	const network = useMemo(
		() => (activeChain?.unsupported ? chain.optimism : activeChain ?? chain.optimism),
		[activeChain]
	);

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

	const dispatch = useAppDispatch();

	useEffect(() => {
		sdk.setProvider(provider).then((networkId) => {
			dispatch(resetNetwork(networkId));
			blockExplorer = generateExplorerFunctions(getBaseUrl(networkId));
			transactionNotifier = new BaseTN(provider);
		});
	}, [provider, dispatch]);

	useEffect(() => {
		if (signer) {
			Promise.all([signer.getAddress(), sdk.setSigner(signer)]).then(([address]) => {
				dispatch(resetWalletAddress(address));
			});
		}
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
		unsupportedNetwork,
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
		l2Synthetixjs,
		l2SynthsMap,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

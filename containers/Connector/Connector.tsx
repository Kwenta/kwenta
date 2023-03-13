import { TransactionNotifier as BaseTN } from '@synthetixio/transaction-notifier';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useAccount, useNetwork, useSigner, useProvider } from 'wagmi';

import { NetworkId } from 'sdk/types/common';
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

	return {
		activeChain,
		isWalletConnected,
		walletAddress,
		provider,
		l2Provider,
		signer,
		network,
		providerReady,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

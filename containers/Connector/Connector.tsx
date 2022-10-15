import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import { TransactionNotifier as BaseTN } from '@synthetixio/transaction-notifier';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import { fetchSynthBalances } from 'state/balances/actions';
import { fetchBalances, fetchRates, fetchTokenList } from 'state/exchange/actions';
import { sdk, useAppDispatch } from 'state/store';
import { setNetwork, setWalletAddress } from 'state/wallet/reducer';
import { createContainer } from 'unstated-next';
import { chain, useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

import { generateExplorerFunctions, getBaseUrl } from 'containers/BlockExplorer/BlockExplorer';

import { wagmiClient } from './config';

export let TransactionNotifier = new BaseTN(wagmiClient.provider);
export let BlockExplorer = generateExplorerFunctions(getBaseUrl(10));

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
		sdk.setProvider(provider);
		TransactionNotifier = new BaseTN(provider);
	}, [provider]);

	useEffect(() => {
		sdk.setNetworkId(network.id as NetworkId).then(async () => {
			dispatch(setNetwork({ networkId: network.id as NetworkId }));
			BlockExplorer = generateExplorerFunctions(getBaseUrl(network.id as NetworkId));
			await dispatch(fetchTokenList());
			dispatch(fetchSynthBalances());
			dispatch(fetchBalances());
			dispatch(fetchRates());
		});
	}, [network.id, dispatch]);

	useEffect(() => {
		if (signer) {
			sdk.setSigner(signer).then(async () => {
				const address = await signer.getAddress();
				dispatch(setWalletAddress({ walletAddress: address }));
				await dispatch(fetchSynthBalances());
				dispatch(fetchBalances());
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

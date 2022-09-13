import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useMemo } from 'react';
import { createContainer } from 'unstated-next';
import { chain, useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

const useConnector = () => {
	const { chain: activeChain } = useNetwork();
	const { address, isConnected: isWalletConnected } = useAccount();
	const network = useMemo(
		() =>
			activeChain !== undefined && activeChain.unsupported
				? chain.optimism
				: activeChain ?? chain.optimism,
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

	const [synthsMap, tokensMap] = useMemo(() => {
		if (defaultSynthetixjs == null) return [{}, {}];

		return [keyBy(defaultSynthetixjs.synths, 'name'), keyBy(defaultSynthetixjs.tokens, 'symbol')];
	}, [defaultSynthetixjs]);

	const l2SynthsMap = useMemo(() => {
		if (l2Synthetixjs == null) return {};

		return keyBy(l2Synthetixjs.synths, 'name');
	}, [l2Synthetixjs]);

	return {
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

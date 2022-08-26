import { NetworkId, synthetix } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useMemo } from 'react';
import { createContainer } from 'unstated-next';
import { chain, useNetwork, useProvider, useSigner } from 'wagmi';

const useConnector = () => {
	const { chain: activeChain } = useNetwork();
	const network =
		activeChain !== undefined && activeChain.unsupported
			? chain.optimism
			: activeChain ?? chain.optimism;

	const provider = useProvider({ chainId: network.id });
	const L2Provider = useProvider({ chainId: chain.optimism.id });
	const { data: signer } = useSigner();
	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();

	const defaultSynthetixjs = useMemo(
		() => synthetix({ provider, networkId: network.id as NetworkId }),
		[provider, network.id]
	);

	const [synthsMap, tokensMap] = useMemo(() => {
		if (defaultSynthetixjs == null) return [{}, {}];

		return [keyBy(defaultSynthetixjs.synths, 'name'), keyBy(defaultSynthetixjs.tokens, 'symbol')];
	}, [defaultSynthetixjs]);

	return {
		provider,
		L2Provider,
		signer,
		network,
		synthsMap,
		tokensMap,
		staticMainnetProvider,
		defaultSynthetixjs,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

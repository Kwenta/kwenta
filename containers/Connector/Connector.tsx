import { synthetix } from '@synthetixio/contracts-interface';
import { getOptimismProvider } from '@synthetixio/providers';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useMemo } from 'react';
import { createContainer } from 'unstated-next';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';

const useConnector = () => {
	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();
	const defaultSynthetixjs = synthetix({
		provider: getOptimismProvider({ networkId: DEFAULT_NETWORK_ID }),
		networkId: DEFAULT_NETWORK_ID,
	});

	const [synthsMap, tokensMap] = useMemo(() => {
		if (defaultSynthetixjs == null) return [{}, {}];

		return [keyBy(defaultSynthetixjs.synths, 'name'), keyBy(defaultSynthetixjs.tokens, 'symbol')];
	}, [defaultSynthetixjs]);

	return {
		synthsMap,
		tokensMap,
		staticMainnetProvider,
		defaultSynthetixjs,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

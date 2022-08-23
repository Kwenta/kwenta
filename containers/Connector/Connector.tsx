import { SynthetixJS, synthetix } from '@synthetixio/contracts-interface';
import { getOptimismProvider } from '@synthetixio/providers';
import { ethers } from 'ethers';
import { keyBy } from 'lodash';
import { useState } from 'react';
import { useMemo } from 'react';
import { createContainer } from 'unstated-next';

import { DEFAULT_NETWORK_ID } from 'constants/defaults';

const useConnector = () => {
	const [synthetixjs] = useState<SynthetixJS | null>(null);

	// Provides a default mainnet provider, irrespective of the current network
	const staticMainnetProvider = new ethers.providers.InfuraProvider();
	const defaultSynthetixjs = synthetix({
		provider: getOptimismProvider({ networkId: DEFAULT_NETWORK_ID }),
		networkId: DEFAULT_NETWORK_ID,
		useOvm: true,
	});

	const [synthsMap, tokensMap] = useMemo(() => {
		if (synthetixjs == null) return [{}, {}];

		return [keyBy(synthetixjs.synths, 'name'), keyBy(synthetixjs.tokens, 'symbol')];
	}, [synthetixjs]);

	return {
		synthetixjs,
		synthsMap,
		tokensMap,
		staticMainnetProvider,
		defaultSynthetixjs,
	};
};

const Connector = createContainer(useConnector);

export default Connector;

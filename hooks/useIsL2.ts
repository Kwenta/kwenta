import { NetworkId } from '@synthetixio/contracts-interface';
import { useMemo } from 'react';
import { chain } from 'wagmi';

import { notNill } from 'queries/synths/utils';

const useIsL2 = (networkId: NetworkId) => {
	const isL2 = useMemo(
		() =>
			notNill(networkId) ? [chain.optimism.id, chain.optimismGoerli.id].includes(networkId) : true,
		[networkId]
	);
	return isL2;
};

export default useIsL2;

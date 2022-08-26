import { useMemo } from 'react';
import { chain, useNetwork } from 'wagmi';

import { notNill } from 'queries/synths/utils';

const useIsL2 = () => {
	const { chain: network } = useNetwork();
	const isL2 = useMemo(
		() =>
			notNill(network) ? [chain.optimism.id, chain.optimismGoerli.id].includes(network.id) : true,
		[network]
	);
	return isL2;
};

export default useIsL2;

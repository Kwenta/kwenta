import { useMemo } from 'react';
import { chain, useNetwork } from 'wagmi';

import { notNill } from 'queries/synths/utils';

const useIsL1 = () => {
	const { chain: network } = useNetwork();
	const isL1 = useMemo(
		() => (notNill(network) ? [chain.mainnet.id, chain.goerli.id].includes(network.id) : false),
		[network]
	);
	return isL1;
};

export default useIsL1;

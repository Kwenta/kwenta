import { useMemo } from 'react';
import { chain } from 'wagmi';

import Connector from 'containers/Connector';
import { notNill } from 'queries/synths/utils';

const useIsL2 = () => {
	const { network } = Connector.useContainer();
	const isL2 = useMemo(
		() =>
			notNill(network) ? [chain.optimism.id, chain.optimismGoerli.id].includes(network.id) : true,
		[network]
	);
	return isL2;
};

export default useIsL2;

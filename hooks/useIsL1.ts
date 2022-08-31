import { useMemo } from 'react';
import { chain } from 'wagmi';

import Connector from 'containers/Connector';
import { notNill } from 'queries/synths/utils';

const useIsL1 = () => {
	const { network } = Connector.useContainer();
	const isL1 = useMemo(
		() => (notNill(network) ? [chain.mainnet.id, chain.goerli.id].includes(network.id) : false),
		[network]
	);
	return isL1;
};

export default useIsL1;

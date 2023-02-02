import { useMemo } from 'react';

import Connector from 'containers/Connector';
import { chain } from 'containers/Connector/config';
import { notNill } from 'queries/synths/utils';

const useIsL2 = () => {
	const { activeChain } = Connector.useContainer();
	const isL2 = useMemo(
		() =>
			notNill(activeChain)
				? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain.id)
				: false,
		[activeChain]
	);
	return isL2;
};

export default useIsL2;

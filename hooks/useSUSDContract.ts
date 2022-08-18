import { useMemo } from 'react';

import Connector from 'containers/Connector';
import { ERC20, ERC20__factory } from 'lib/abis/types';

export default function useSUSDContract(): ERC20 | null {
	const { tokensMap: synthTokensMap, signer } = Connector.useContainer();

	const susdContract = useMemo(() => {
		if (!signer || !synthTokensMap.sUSD) return null;

		return ERC20__factory.connect(synthTokensMap.sUSD.address, signer);
	}, [synthTokensMap.sUSD, signer]);

	return susdContract;
}

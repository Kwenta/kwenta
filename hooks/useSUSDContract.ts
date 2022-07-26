import { Contract } from 'ethers';
import erc20Abi from 'lib/abis/ERC20.json';
import { useMemo } from 'react';

import Connector from 'containers/Connector';

export default function useSUSDContract(): Contract | null {
	const { tokensMap: synthTokensMap, signer } = Connector.useContainer();

	const susdContract = useMemo(() => {
		if (!signer || !synthTokensMap.sUSD) return null;
		return new Contract(synthTokensMap.sUSD.address, erc20Abi, signer);
	}, [synthTokensMap.sUSD, signer]);

	return susdContract;
}

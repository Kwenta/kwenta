import { Contract } from 'ethers';
import { useMemo, useState } from 'react';

import Connector from 'containers/Connector';
import erc20Abi from 'lib/abis/ERC20.json';

export default function useSUSDContract(): Contract | null {
	const { tokensMap: synthTokensMap, signer } = Connector.useContainer();

	// TODO: Get address from subgraph or factory contract event '0xf20Ff693ae571f03A2Bc613f053D0652bA9b433a'

	const susdContract = useMemo(() => {
		if (!signer || !synthTokensMap.sUSD) return null;
		return new Contract(synthTokensMap.sUSD.address, erc20Abi, signer);
	}, [synthTokensMap.sUSD?.address]);

	return susdContract;
}

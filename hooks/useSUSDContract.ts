import { Contract } from 'ethers';
import { useMemo } from 'react';
import { useSigner } from 'wagmi';

import Connector from 'containers/Connector';
import erc20Abi from 'lib/abis/ERC20.json';

export default function useSUSDContract(): Contract | null {
	const { tokensMap: synthTokensMap } = Connector.useContainer();
	const { data: signer } = useSigner();

	const susdContract = useMemo(() => {
		if (!signer || !synthTokensMap.sUSD) return null;
		return new Contract(synthTokensMap.sUSD.address, erc20Abi, signer);
	}, [synthTokensMap.sUSD, signer]);

	return susdContract;
}

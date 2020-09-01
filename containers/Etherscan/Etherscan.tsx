import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';

import EtherscanLinks from 'utils/etherscan';

import { networkState } from 'store/connection';

const useEtherscan = () => {
	const network = useRecoilValue(networkState);
	const [etherscanInstance, setEtherscanInstance] = useState<EtherscanLinks | null>(null);

	useEffect(() => {
		if (network) {
			setEtherscanInstance(new EtherscanLinks(network));
		}
	}, [network]);

	return {
		etherscanInstance,
	};
};

const Etherscan = createContainer(useEtherscan);

export default Etherscan;

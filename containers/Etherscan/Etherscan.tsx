import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { useRecoilValue } from 'recoil';

import EtherscanLinks from 'utils/etherscan';

import { networkIdState } from 'store/connection';

const useEtherscan = () => {
	const networkId = useRecoilValue(networkIdState);
	const [etherscanInstance, setEtherscanInstance] = useState<EtherscanLinks>(
		new EtherscanLinks(networkId)
	);

	useEffect(() => {
		setEtherscanInstance(new EtherscanLinks(networkId));
	}, [networkId]);

	return etherscanInstance;
};

const Etherscan = createContainer(useEtherscan);

export default Etherscan;

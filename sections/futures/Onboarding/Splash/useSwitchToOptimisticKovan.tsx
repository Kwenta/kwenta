import { OPTIMISM_NETWORKS } from '@synthetixio/optimism-networks';
import Connector from 'containers/Connector';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState } from 'store/wallet';

const useSwitchToOptimisticKovan = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();

	const switchNetwork = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			const ethereum = window.ethereum;

			if (!ethereum || !ethereum.isMetaMask) throw new Error('Metamask is not installed');
			return await (ethereum as any).request({
				method: 'wallet_addEthereumChain',
				params: [OPTIMISM_NETWORKS['69']],
			});
		} catch (e) {
			setNetworkError((e as any).message);
		}
	};

	return switchNetwork;
};

export default useSwitchToOptimisticKovan;

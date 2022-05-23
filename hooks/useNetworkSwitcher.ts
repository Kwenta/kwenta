import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';
import {
	MAP_L1_TO_L2_NETWORKS,
	MAP_L2_TO_L1_NETWORKS,
	NETWORK_TO_WEB3_ONBOARD,
} from 'containers/Connector/config';

const useNetworkSwitcher = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet, switchToChain } = Connector.useContainer();

	const switchToL1 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);

			const networkId = NETWORK_TO_WEB3_ONBOARD[network.id];
			switchToChain(MAP_L2_TO_L1_NETWORKS[networkId]);
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	const switchToL2 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);

			const networkId = NETWORK_TO_WEB3_ONBOARD[network.id];
			switchToChain(MAP_L1_TO_L2_NETWORKS[networkId]);
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	return {
		switchToL1,
		switchToL2,
	};
};

export default useNetworkSwitcher;

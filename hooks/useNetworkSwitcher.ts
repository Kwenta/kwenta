import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, networkState } from 'store/wallet';
import Connector from 'containers/Connector';
import { L2_TO_L1_NETWORK_MAPPER } from '@synthetixio/optimism-networks';
import { INFURA_SUPPORTED_NETWORKS } from 'utils/infura';
import { NetworkId, NetworkName } from '@synthetixio/contracts-interface';

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

			const id = L2_TO_L1_NETWORK_MAPPER[network.id] as NetworkId;
			const name = INFURA_SUPPORTED_NETWORKS[id] as NetworkName;
			switchToChain({ id, name });
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

			const idStr = Object.keys(L2_TO_L1_NETWORK_MAPPER).find(
				(k) => L2_TO_L1_NETWORK_MAPPER[k].toString() === network.id.toString()
			);
			if (idStr) {
				const id = +idStr as NetworkId;
				const name = INFURA_SUPPORTED_NETWORKS[id] as NetworkName;
				switchToChain({ id, name });
			} else {
				// If the web3-onboard is not equivalent to any infura chain id, return null
				console.log(
					"Can't find an equivalent for this web3-onboard chain id:",
					network.id,
					L2_TO_L1_NETWORK_MAPPER
				);
			}
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

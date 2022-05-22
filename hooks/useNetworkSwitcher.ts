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

			console.log('SWITCHING TO L1');
			const l1ChainId = L2_TO_L1_NETWORK_MAPPER[network.id] as NetworkId;
			const l1ChainName = INFURA_SUPPORTED_NETWORKS[l1ChainId] as NetworkName;
			console.log(l1ChainId, l1ChainName); // TODO: remove
			switchToChain({
				id: l1ChainId,
				name: l1ChainName,
			});
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

			console.log('SWITCHING TO L2');
			const l2ChainIdStr = Object.keys(L2_TO_L1_NETWORK_MAPPER).find(
				(k) => L2_TO_L1_NETWORK_MAPPER[k] === network.id
			);
			console.log(l2ChainIdStr, L2_TO_L1_NETWORK_MAPPER, network.id);
			if (l2ChainIdStr) {
				const l2ChainId = +l2ChainIdStr as NetworkId;
				const l2ChainName = INFURA_SUPPORTED_NETWORKS[l2ChainId] as NetworkName;
				console.log(l2ChainName); // TODO: remove
				switchToChain({
					id: l2ChainId,
					name: l2ChainName,
				});
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

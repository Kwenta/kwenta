import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
import { L2_TO_L1_NETWORK_MAPPER } from '@synthetixio/optimism-networks';
import { utils, BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chain, useConnect } from 'wagmi';

import Connector from 'containers/Connector';

const useNetworkSwitcher = () => {
	const { network, isWalletConnected } = Connector.useContainer();
	const { connect: connectWallet } = useConnect();
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();

	const switchToL1 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);

			const formattedChainId = utils.hexStripZeros(
				BigNumber.from(L2_TO_L1_NETWORK_MAPPER[network?.id ?? chain.optimism.id]).toHexString()
			);
			(window.ethereum as any).request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: formattedChainId }],
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
			addOptimismNetworkToMetamask({ ethereum: window.ethereum });
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

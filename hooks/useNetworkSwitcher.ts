import { addOptimismNetworkToMetamask } from '@synthetixio/optimism-networks';
import { L2_TO_L1_NETWORK_MAPPER } from '@synthetixio/optimism-networks';
import { utils, BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chain, useAccount, useConnect, useNetwork } from 'wagmi';

const useNetworkSwitcher = () => {
	const [, setNetworkError] = useState<string | null>(null);

	const { t } = useTranslation();
	const { chain: activeChain } = useNetwork();
	const { isConnected: isWalletConnected } = useAccount();
	const { connect: connectWallet } = useConnect();

	const switchToL1 = async () => {
		if (!isWalletConnected) await connectWallet();
		try {
			if (!window.ethereum || !window.ethereum.isMetaMask) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);

			const formattedChainId = utils.hexStripZeros(
				BigNumber.from(L2_TO_L1_NETWORK_MAPPER[activeChain?.id ?? chain.optimism.id]).toHexString()
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

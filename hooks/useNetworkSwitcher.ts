import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnect, useSwitchNetwork } from 'wagmi';

import Connector from 'containers/Connector';

const useNetworkSwitcher = () => {
	const { isWalletConnected } = Connector.useContainer();
	const { connect: connectWallet } = useConnect();
	const [, setNetworkError] = useState<string | null>(null);
	const { switchNetwork } = useSwitchNetwork();

	const { t } = useTranslation();

	const switchToL2 = async () => {
		if (!isWalletConnected) connectWallet();
		try {
			if (!switchNetwork) {
				return setNetworkError(t('user-menu.error.please-install-metamask'));
			}
			setNetworkError(null);
			switchNetwork(10);
		} catch (e) {
			setNetworkError(e.message);
		}
	};

	return {
		switchToL2,
	};
};

export default useNetworkSwitcher;

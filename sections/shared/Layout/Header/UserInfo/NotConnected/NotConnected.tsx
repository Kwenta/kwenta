import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Connector from 'containers/Connector';

const NotConnected: FC = () => {
	const { onboard } = Connector.useContainer();
	const { t } = useTranslation();

	const connectWallet = async () => {
		try {
			if (onboard) {
				const success = await onboard.walletSelect();
				if (success) {
					await onboard.walletCheck();
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<Button variant="primary" onClick={connectWallet}>
			{t('header.not-connected.connect-wallet')}
		</Button>
	);
};

export default NotConnected;

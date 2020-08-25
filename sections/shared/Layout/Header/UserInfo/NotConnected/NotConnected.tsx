import { FC } from 'react';

import Button from 'components/Button';
import Connector from 'containers/Connector';

const NotConnected: FC = () => {
	const { onboard } = Connector.useContainer();

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
			Connect your wallet
		</Button>
	);
};

export default NotConnected;

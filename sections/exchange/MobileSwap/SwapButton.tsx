import { useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useExchangeContext } from 'contexts/ExchangeContext';

const SwapButton: React.FC = () => {
	const { isWalletConnected } = Connector.useContainer();
	const { t } = useTranslation();
	const { openConnectModal: connectWallet } = useConnectModal();
	const {
		isApproved,
		needsApproval,
		handleSubmit,
		handleApprove,
		submissionDisabledReason,
	} = useExchangeContext();

	return isWalletConnected ? (
		<Button
			isRounded
			noOutline
			disabled={!!submissionDisabledReason}
			onClick={needsApproval && !isApproved ? handleApprove : handleSubmit}
			size="md"
			data-testid="submit-order"
			fullWidth
		>
			{!!submissionDisabledReason
				? submissionDisabledReason
				: needsApproval && !isApproved
				? t('exchange.summary-info.button.approve')
				: t('exchange.summary-info.button.submit-order')}
		</Button>
	) : (
		<Button onClick={connectWallet} size="md" fullWidth noOutline>
			{t('common.wallet.connect-wallet')}
		</Button>
	);
};

export default SwapButton;

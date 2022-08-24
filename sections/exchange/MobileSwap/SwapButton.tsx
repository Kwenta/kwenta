import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { isWalletConnectedState } from 'store/wallet';

const SwapButton: React.FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const {
		isApproved,
		needsApproval,
		handleSubmit,
		handleApprove,
		submissionDisabledReason,
	} = useExchangeContext();

	return isWalletConnected ? (
		<Button
			disabled={!!submissionDisabledReason}
			onClick={needsApproval && !isApproved ? handleApprove : handleSubmit}
			size="md"
			data-testid="submit-order"
			fullWidth
			variant="primary"
		>
			{!!submissionDisabledReason
				? submissionDisabledReason
				: !isApproved
				? t('exchange.summary-info.button.approve')
				: t('exchange.summary-info.button.submit-order')}
		</Button>
	) : (
		<Button onClick={connectWallet} size="md" fullWidth variant="primary">
			{t('common.wallet.connect-wallet')}
		</Button>
	);
};

export default SwapButton;

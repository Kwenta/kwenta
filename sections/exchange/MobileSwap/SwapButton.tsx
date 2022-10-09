import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'state/store';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useExchangeContext } from 'contexts/ExchangeContext';
import useApproveExchange from 'hooks/useApproveExchange';

const SwapButton: FC = () => {
	const { isWalletConnected } = Connector.useContainer();
	const { t } = useTranslation();
	const { openConnectModal: connectWallet } = useConnectModal();
	const { handleSubmit, submissionDisabledReason } = useExchangeContext();
	const { isApproved, handleApprove } = useApproveExchange();
	const needsApproval = useAppSelector(({ exchange }) => exchange.needsApproval);

	return isWalletConnected ? (
		<Button
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

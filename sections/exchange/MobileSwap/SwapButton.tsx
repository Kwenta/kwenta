import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { submitApprove, submitExchange } from 'state/exchange/actions';
import {
	selectIsApproved,
	selectNeedsApproval,
	selectSubmissionDisabledReason,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import Button from 'components/Button';
import Connector from 'containers/Connector';

const SwapButton: FC = () => {
	const { isWalletConnected } = Connector.useContainer();
	const { t } = useTranslation();
	const { openConnectModal: connectWallet } = useConnectModal();
	const submissionDisabledReason = useAppSelector(selectSubmissionDisabledReason);
	const isApproved = useAppSelector(selectIsApproved);
	const needsApproval = useAppSelector(selectNeedsApproval);
	const dispatch = useAppDispatch();

	const handleSubmit = useCallback(() => {
		if (needsApproval && !isApproved) {
			dispatch(submitApprove());
		} else {
			dispatch(submitExchange());
		}
	}, [dispatch, isApproved, needsApproval]);

	return isWalletConnected ? (
		<Button
			disabled={!!submissionDisabledReason}
			onClick={handleSubmit}
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

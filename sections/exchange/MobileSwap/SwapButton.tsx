import React from 'react';
import Button from 'components/Button';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { useTranslation } from 'react-i18next';

const SwapButton: React.FC = () => {
	const { t } = useTranslation();
	const {
		isApproved,
		needsApproval,
		handleSubmit,
		handleApprove,
		submissionDisabledReason,
	} = useExchangeContext();

	return (
		<Button
			isRounded
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
	);
};

export default SwapButton;

import { memo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'state/store';

import Button from 'components/Button';
import useRedeem from 'hooks/useRedeem';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';

const RedeemButton: FC = memo(() => {
	const { t } = useTranslation();
	const openModal = useAppSelector(({ exchange }) => exchange.openModal);
	const { handleRedeem } = useRedeem();

	return (
		<>
			<Button
				variant="primary"
				disabled={false}
				onClick={handleRedeem}
				size="lg"
				data-testid="submit-order"
				fullWidth
			>
				{t('dashboard.deprecated.button.redeem-synths')}
			</Button>
			{openModal === 'redeem' && <RedeemTxModal attemptRetry={handleRedeem} />}
		</>
	);
});

export default RedeemButton;

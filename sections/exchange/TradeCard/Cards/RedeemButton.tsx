import { memo, FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import RedeemTxModal from 'sections/dashboard/Deprecated/RedeemTxModal';
import { submitRedeem } from 'state/exchange/actions';
import { useAppDispatch, useAppSelector } from 'state/hooks';

const RedeemButton: FC = memo(() => {
	const { t } = useTranslation();
	const openModal = useAppSelector(({ exchange }) => exchange.openModal);
	const dispatch = useAppDispatch();

	const handleRedeem = useCallback(() => {
		dispatch(submitRedeem());
	}, [dispatch]);

	return (
		<>
			<Button
				variant="primary"
				disabled={false}
				onClick={handleRedeem}
				size="large"
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

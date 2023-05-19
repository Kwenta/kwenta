import { useCallback } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { approveCrossMargin } from 'state/futures/actions';
import {
	selectSmartMarginKeeperDeposit,
	selectIsConditionalOrder,
	selectMarketInfo,
	selectNewTradeHasSlTp,
	selectSmartMarginAllowanceValid,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

// TODO: Merge this with TradeConfirmationModal

export default function TradeConfirmationModalCrossMargin() {
	const dispatch = useAppDispatch();

	const isConditionalOrder = useAppSelector(selectIsConditionalOrder);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const marketInfo = useAppSelector(selectMarketInfo);
	const allowanceValid = useAppSelector(selectSmartMarginAllowanceValid);
	const hasSlTp = useAppSelector(selectNewTradeHasSlTp);
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleApproveSmartMargin = useCallback(async () => {
		dispatch(approveCrossMargin());
	}, [dispatch]);

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onApproveAllowance={handleApproveSmartMargin}
			isSubmitting={isSubmitting}
			allowanceValid={allowanceValid}
			executionFee={marketInfo?.keeperDeposit ?? zeroBN}
			keeperFee={isConditionalOrder || hasSlTp ? keeperEthDeposit : null}
		/>
	);
}

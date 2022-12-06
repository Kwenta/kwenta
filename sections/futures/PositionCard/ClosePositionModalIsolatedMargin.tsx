import { closeIsolatedMarginPosition } from 'state/futures/actions';
import { selectIsolatedTradeInputs, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalIsolatedMargin({ onDismiss }: Props) {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const { priceImpactDelta } = useAppSelector(selectIsolatedTradeInputs);
	const positionDetails = position?.position;

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			positionDetails={positionDetails}
			onClosePosition={() => dispatch(closeIsolatedMarginPosition(priceImpactDelta))}
		/>
	);
}

import { closeIsolatedMarginPosition } from 'state/futures/actions';
import { selectIsolatedPriceImpact, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalIsolatedMargin({ onDismiss }: Props) {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const priceImpact = useAppSelector(selectIsolatedPriceImpact);
	const positionDetails = position?.position;

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			positionDetails={positionDetails}
			onClosePosition={() => dispatch(closeIsolatedMarginPosition(priceImpact))}
		/>
	);
}

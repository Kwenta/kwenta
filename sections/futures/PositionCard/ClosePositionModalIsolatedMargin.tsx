import { closeIsolatedMarginPosition } from 'state/futures/actions';
import { selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalIsolatedMargin({ onDismiss }: Props) {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			positionDetails={positionDetails}
			onClosePosition={() => dispatch(closeIsolatedMarginPosition())}
		/>
	);
}

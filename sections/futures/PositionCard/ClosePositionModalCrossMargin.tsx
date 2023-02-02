import { closeCrossMarginPosition } from 'state/futures/actions';
import { selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalCrossMargin({ onDismiss }: Props) {
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;

	const closePosition = async () => {
		dispatch(closeCrossMarginPosition());
	};

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			positionDetails={positionDetails}
			onClosePosition={closePosition}
		/>
	);
}

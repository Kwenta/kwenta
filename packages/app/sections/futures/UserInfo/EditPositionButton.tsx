import { FuturesMarketKey } from '@kwenta/sdk/types';

import PencilButton from 'components/Button/PencilButton';
import { setShowPositionModal } from 'state/app/reducer';
import { FuturesPositionModalType } from 'state/app/types';
import { useAppDispatch } from 'state/hooks';

export default function EditPositionButton({
	marketKey,
	modalType,
}: {
	marketKey: FuturesMarketKey;
	modalType: FuturesPositionModalType;
}) {
	const dispatch = useAppDispatch();
	return (
		<PencilButton
			width={9}
			onClick={() =>
				dispatch(
					setShowPositionModal({
						type: modalType,
						marketKey: marketKey,
					})
				)
			}
		/>
	);
}

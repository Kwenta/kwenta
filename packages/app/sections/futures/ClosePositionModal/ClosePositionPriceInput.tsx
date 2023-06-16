import { wei } from '@synthetixio/wei';
import { ChangeEvent, useCallback } from 'react';

import { PositionSide } from 'sdk/types/futures';
import { selectShowPositionModal } from 'state/app/selectors';
import { editClosePositionPrice } from 'state/futures/actions';
import {
	selectClosePositionOrderInputs,
	selectEditPositionModalInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import OrderPriceInput from '../OrderPriceInput';

export default function ClosePositionPriceInput() {
	const dispatch = useAppDispatch();

	const { orderType, price } = useAppSelector(selectClosePositionOrderInputs);
	const showPositionModal = useAppSelector(selectShowPositionModal);
	const { position, marketPrice } = useAppSelector(selectEditPositionModalInfo);

	const positionSide =
		position?.position?.side === PositionSide.SHORT ? PositionSide.LONG : PositionSide.SHORT;

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			if (showPositionModal?.marketKey) {
				dispatch(editClosePositionPrice(showPositionModal.marketKey, v));
			}
		},
		[dispatch, showPositionModal?.marketKey]
	);

	return (
		<OrderPriceInput
			orderType={orderType}
			orderPrice={price?.value || ''}
			positionSide={positionSide}
			marketPrice={marketPrice ?? wei(0)}
			onChange={handleOnChange}
		/>
	);
}

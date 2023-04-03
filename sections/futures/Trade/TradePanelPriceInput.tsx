import { ChangeEvent, useCallback } from 'react';

import { editTradeOrderPrice } from 'state/futures/actions';
import {
	selectCrossMarginOrderPrice,
	selectLeverageSide,
	selectMarketPrice,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import OrderPriceInput from '../OrderPriceInput';

export default function TradePanelPriceInput() {
	const dispatch = useAppDispatch();

	const marketPrice = useAppSelector(selectMarketPrice);
	const leverageSide = useAppSelector(selectLeverageSide);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const orderType = useAppSelector(selectOrderType);

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(editTradeOrderPrice(v));
		},
		[dispatch]
	);

	return (
		<OrderPriceInput
			orderType={orderType}
			orderPrice={orderPrice}
			positionSide={leverageSide}
			marketPrice={marketPrice}
			onChange={handleOnChange}
		/>
	);
}

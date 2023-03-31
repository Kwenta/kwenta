import SegmentedControl from 'components/SegmentedControl';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import { FuturesOrderType } from 'sdk/types/futures';
import { OrderNameByType } from 'sdk/utils/futures';
import { editTradeOrderPrice } from 'state/futures/actions';
import { setOrderType } from 'state/futures/reducer';
import { selectCrossMarginOrderType } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

export default function OrderTypeSelector() {
	const dispatch = useAppDispatch();
	const orderType = useAppSelector(selectCrossMarginOrderType);

	return (
		<SegmentedControl
			values={CROSS_MARGIN_ORDER_TYPES.map((o) => OrderNameByType[o])}
			selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
			onChange={(index: number) => {
				const type = CROSS_MARGIN_ORDER_TYPES[index];
				setOrderType(type as FuturesOrderType);
				dispatch(setOrderType(type));
				dispatch(editTradeOrderPrice(''));
			}}
		/>
	);
}

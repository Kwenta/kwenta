import SegmentedControl from 'components/SegmentedControl';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import { SmartMarginOrderType } from 'sdk/types/futures';
import { OrderNameByType } from 'sdk/utils/futures';
import { editTradeOrderPrice } from 'state/futures/actions';
import { useAppDispatch } from 'state/hooks';

type Props = {
	orderType: SmartMarginOrderType;
	setOrderTypeAction: (payload: any) => any;
};

export default function OrderTypeSelector({ setOrderTypeAction, orderType }: Props) {
	const dispatch = useAppDispatch();

	return (
		<SegmentedControl
			values={CROSS_MARGIN_ORDER_TYPES.map((o) => OrderNameByType[o])}
			selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
			onChange={(index: number) => {
				const type = CROSS_MARGIN_ORDER_TYPES[index];
				dispatch(setOrderTypeAction(type));
				dispatch(editTradeOrderPrice(''));
			}}
		/>
	);
}

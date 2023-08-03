import { CROSS_MARGIN_ORDER_TYPES } from '@kwenta/sdk/constants'
import { SmartMarginOrderType } from '@kwenta/sdk/types'
import { OrderNameByType } from '@kwenta/sdk/utils'

import SegmentedControl from 'components/SegmentedControl'
import { editTradeOrderPrice } from 'state/futures/smartMargin/actions'
import { useAppDispatch } from 'state/hooks'

type Props = {
	orderType: SmartMarginOrderType
	setOrderTypeAction: (payload: any) => any
}

export default function OrderTypeSelector({ setOrderTypeAction, orderType }: Props) {
	const dispatch = useAppDispatch()

	return (
		<SegmentedControl
			values={CROSS_MARGIN_ORDER_TYPES.map((o) => OrderNameByType[o])}
			selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
			onChange={(index) => {
				const type = CROSS_MARGIN_ORDER_TYPES[index]
				dispatch(setOrderTypeAction(type))
				dispatch(editTradeOrderPrice(''))
			}}
		/>
	)
}

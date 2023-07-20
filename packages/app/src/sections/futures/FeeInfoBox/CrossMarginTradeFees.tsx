import { ZERO_WEI } from '@kwenta/sdk/constants'
import { memo } from 'react'

import {
	selectCrossMarginTradePreview,
	selectV3MarketInfo,
} from 'state/futures/crossMargin/selectors'
import { useAppSelector } from 'state/hooks'

import FeeRows from './FeeRows'

const CrossMarginTradeFees = memo(() => {
	const tradePreview = useAppSelector(selectCrossMarginTradePreview)
	const marketInfo = useAppSelector(selectV3MarketInfo)

	return (
		<FeeRows
			executionFee={tradePreview?.settlementFee ?? ZERO_WEI}
			tradeFee={tradePreview?.fee ?? ZERO_WEI}
			orderType={'market'}
			rates={{
				maker: marketInfo?.feeRates.makerFeeOffchainDelayedOrder ?? ZERO_WEI,
				taker: marketInfo?.feeRates.takerFeeOffchainDelayedOrder ?? ZERO_WEI,
			}}
		/>
	)
})

export default CrossMarginTradeFees

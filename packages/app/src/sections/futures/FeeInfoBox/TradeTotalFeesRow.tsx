import { ZERO_WEI } from '@kwenta/sdk/constants'
import { memo } from 'react'

import { selectMarketInfo } from 'state/futures/selectors'
import {
	selectOrderType,
	selectSmartMarginKeeperDeposit,
	selectTradePreview,
} from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

import FeesRow from './FeesRow'

const TradeTotalFeesRow = memo(() => {
	const tradePreview = useAppSelector(selectTradePreview)
	const marketInfo = useAppSelector(selectMarketInfo)
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit)
	const orderType = useAppSelector(selectOrderType)

	return (
		<FeesRow
			executionFee={marketInfo?.keeperDeposit ?? ZERO_WEI}
			tradeFee={tradePreview?.fee ?? ZERO_WEI}
			orderType={orderType}
			smartMarginKeeperDeposit={keeperEthDeposit}
			rates={{
				maker: marketInfo?.feeRates.makerFeeOffchainDelayedOrder ?? ZERO_WEI,
				taker: marketInfo?.feeRates.takerFeeOffchainDelayedOrder ?? ZERO_WEI,
			}}
		/>
	)
})

export default TradeTotalFeesRow

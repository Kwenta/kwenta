import { ZERO_WEI } from '@kwenta/sdk/constants'
import { memo } from 'react'

import {
	selectClosePositionOrderInputs,
	selectClosePositionPreview,
	selectEditPositionModalInfo,
	selectSmartMarginKeeperDeposit,
} from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

import FeesRow from './FeeRows'

const ClosePositionFeeInfo = memo(() => {
	const tradePreview = useAppSelector(selectClosePositionPreview)
	const { market } = useAppSelector(selectEditPositionModalInfo)
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit)
	const { orderType } = useAppSelector(selectClosePositionOrderInputs)

	return (
		<FeesRow
			executionFee={market?.keeperDeposit ?? ZERO_WEI}
			tradeFee={tradePreview?.fee ?? ZERO_WEI}
			orderType={orderType}
			smartMarginKeeperDeposit={keeperEthDeposit}
			rates={{
				maker: market?.feeRates.makerFeeOffchainDelayedOrder ?? ZERO_WEI,
				taker: market?.feeRates.takerFeeOffchainDelayedOrder ?? ZERO_WEI,
			}}
		/>
	)
})

export default ClosePositionFeeInfo

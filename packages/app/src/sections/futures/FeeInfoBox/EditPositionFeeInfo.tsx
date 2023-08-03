import { ZERO_WEI } from '@kwenta/sdk/constants'
import { memo } from 'react'

import {
	selectEditPositionModalInfo,
	selectEditPositionPreview,
	selectSmartMarginKeeperDeposit,
	selectSmartMarginOrderType,
} from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

import FeesRow from './FeeRows'

const EditPositionFeeInfo = memo(() => {
	const tradePreview = useAppSelector(selectEditPositionPreview)
	const { market } = useAppSelector(selectEditPositionModalInfo)
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit)
	const orderType = useAppSelector(selectSmartMarginOrderType)

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

export default EditPositionFeeInfo

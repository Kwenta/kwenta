import { SWAP_DEPOSIT_TOKENS } from '@kwenta/sdk/constants'
import { SwapDepositToken } from '@kwenta/sdk/types'
import { useCallback } from 'react'

import SmallToggle from 'components/SmallToggle'
import { setSelectedSwapDepositToken } from 'state/futures/reducer'
import { selectSelectedSwapDepositToken } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const SwapDepositTokenSelector = () => {
	const dispatch = useAppDispatch()
	const selectedToken = useAppSelector(selectSelectedSwapDepositToken)

	const handleTokenSelect = useCallback(
		(token: SwapDepositToken) => {
			dispatch(setSelectedSwapDepositToken(token))
		},
		[dispatch]
	)

	return (
		<div>
			<SmallToggle
				value={selectedToken}
				options={SWAP_DEPOSIT_TOKENS}
				onOptionClick={handleTokenSelect}
			/>
		</div>
	)
}

export default SwapDepositTokenSelector

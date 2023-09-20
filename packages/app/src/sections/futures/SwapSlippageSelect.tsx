import { useCallback, useMemo } from 'react'

import SplitSelect from 'components/SplitSelect'
import {
	setSwapDepositCustomSlippage,
	setSwapDepositSlippage,
} from 'state/futures/smartMargin/reducer'
import { selectSwapDepositSlippage } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const SLIPPAGE_OPTIONS = [0.15, 0.25]

const FORMATTED_SLIPPAGE_OPTIONS = SLIPPAGE_OPTIONS.map((s) => ({
	type: 'button' as const,
	value: s,
}))

const SwapSlippageSelect = () => {
	const dispatch = useAppDispatch()
	const slippage = useAppSelector(selectSwapDepositSlippage)

	const handleSelectSlippage = useCallback(
		(slippage: number | undefined) => {
			dispatch(setSwapDepositSlippage(slippage))
		},
		[dispatch]
	)

	const handleCustomSlippageChange = useCallback(
		(s: string) => {
			const standard = s.replace(/[^0-9.,]/g, '').replace(/,/g, '.')
			dispatch(setSwapDepositCustomSlippage(standard))
		},
		[dispatch]
	)

	const options = useMemo(() => {
		return [
			...FORMATTED_SLIPPAGE_OPTIONS,
			{ type: 'input' as const, onChange: handleCustomSlippageChange },
		]
	}, [handleCustomSlippageChange])

	return (
		<SplitSelect
			selected={slippage}
			options={options}
			onSelect={handleSelectSlippage}
			formatOption={(o) => `${o}%`}
		/>
	)
}

export default SwapSlippageSelect

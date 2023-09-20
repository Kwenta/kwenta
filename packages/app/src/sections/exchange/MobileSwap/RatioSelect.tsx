import { FC, useCallback } from 'react'

import SplitSelect from 'components/SplitSelect'
import { setRatio } from 'state/exchange/actions'
import { selectQuoteBalanceWei } from 'state/exchange/selectors'
import type { SwapRatio } from 'state/exchange/types'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const RATIOS: SwapRatio[] = [25, 50, 75, 100]

const RATIO_OPTIONS = RATIOS.map((r) => ({ type: 'button' as const, value: r }))

const RatioSelect: FC = () => {
	const ratio = useAppSelector(({ exchange }) => exchange.ratio)
	const dispatch = useAppDispatch()
	const quoteBalance = useAppSelector(selectQuoteBalanceWei)

	const onRatioChange = useCallback(
		(ratio: SwapRatio) => {
			dispatch(setRatio(ratio))
		},
		[dispatch]
	)

	return (
		<SplitSelect
			selected={ratio}
			options={RATIO_OPTIONS}
			formatOption={(o) => `${o}%`}
			onSelect={onRatioChange}
			disabled={quoteBalance.eq(0)}
		/>
	)
}

export default RatioSelect

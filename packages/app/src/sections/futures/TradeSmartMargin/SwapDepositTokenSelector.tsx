import { SWAP_DEPOSIT_TOKENS } from '@kwenta/sdk/constants'
import { SwapDepositToken } from '@kwenta/sdk/types'
import { FC, useCallback, useMemo } from 'react'

import DAIIcon from 'assets/png/tokens/DAI.png'
// import LUSDIcon from 'assets/png/tokens/LUSD.png'
import SUSDBlackIcon from 'assets/png/tokens/sUSD-Black.png'
import SUSDWhiteIcon from 'assets/png/tokens/sUSD-White.png'
import USDCIcon from 'assets/png/tokens/USDC.png'
// import USDTIcon from 'assets/png/tokens/USDT.png'
import BigToggle from 'components/BigToggle'
import SmallToggle from 'components/SmallToggle'
import { setSelectedSwapDepositToken } from 'state/futures/reducer'
import { selectSelectedSwapDepositToken } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { selectCurrentTheme } from 'state/preferences/selectors'

type SwapDepositTokenSelectorProps = {
	small?: boolean
}

const SwapDepositTokenSelector: FC<SwapDepositTokenSelectorProps> = ({ small = true }) => {
	const dispatch = useAppDispatch()
	const selectedToken = useAppSelector(selectSelectedSwapDepositToken)
	const currentTheme = useAppSelector(selectCurrentTheme)

	const handleTokenSelect = useCallback(
		(token: SwapDepositToken) => {
			dispatch(setSelectedSwapDepositToken(token))
		},
		[dispatch]
	)

	const SUSDIcon = useMemo(() => {
		return currentTheme === 'dark' ? SUSDWhiteIcon : SUSDBlackIcon
	}, [currentTheme])

	const swapTokenIconMap = useMemo(
		() => ({
			[SwapDepositToken.DAI]: DAIIcon,
			[SwapDepositToken.USDC]: USDCIcon,
			// [SwapDepositToken.USDT]: USDTIcon,
			[SwapDepositToken.SUSD]: SUSDIcon,
			// [SwapDepositToken.LUSD]: LUSDIcon,
		}),
		[SUSDIcon]
	)

	return (
		<div>
			{small ? (
				<SmallToggle
					value={selectedToken}
					options={SWAP_DEPOSIT_TOKENS}
					onOptionClick={handleTokenSelect}
					iconMap={swapTokenIconMap}
				/>
			) : (
				<BigToggle
					options={SWAP_DEPOSIT_TOKENS}
					value={selectedToken}
					onOptionClick={handleTokenSelect}
					iconMap={swapTokenIconMap}
				/>
			)}
		</div>
	)
}

export default SwapDepositTokenSelector

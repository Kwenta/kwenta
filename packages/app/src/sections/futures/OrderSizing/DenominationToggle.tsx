import { getDisplayAsset } from '@kwenta/sdk/utils'
import { memo, useCallback } from 'react'

import SwitchAssetArrows from 'assets/svg/futures/switch-arrows.svg'
import InputButton from 'components/Input/InputButton'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { setSelectedInputDenomination } from 'state/futures/reducer'
import { selectSelectedInputDenomination } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

export const DenominationToggle = memo(() => {
	const assetInputType = useAppSelector(selectSelectedInputDenomination)
	const dispatch = useAppDispatch()
	const marketAsset = useAppSelector(selectMarketAsset)

	const toggleDenomination = useCallback(() => {
		dispatch(setSelectedInputDenomination(assetInputType === 'usd' ? 'native' : 'usd'))
	}, [dispatch, assetInputType])

	return (
		<InputButton onClick={toggleDenomination}>
			{assetInputType === 'usd' ? 'sUSD' : getDisplayAsset(marketAsset)}{' '}
			<span>{<SwitchAssetArrows />}</span>
		</InputButton>
	)
})

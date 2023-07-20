import React, { memo } from 'react'
import styled from 'styled-components'

import { selectCrossMarginTradePreview } from 'state/futures/crossMargin/selectors'
import { useAppSelector } from 'state/hooks'

import CrossMarginTradeFees from '../FeeInfoBox/CrossMarginTradeFees'

import { PriceImpactRow, FillPriceRow } from './PreviewRows'

export const CrossMarginTradePanelPreview = memo(() => {
	const preview = useAppSelector(selectCrossMarginTradePreview)

	return (
		<FeeInfoBoxContainer>
			<CrossMarginTradeFees />
			<FillPriceRow fillPrice={preview?.fillPrice} />
			<PriceImpactRow priceImpact={preview?.priceImpact} />
		</FeeInfoBoxContainer>
	)
})

const FeeInfoBoxContainer = styled.div`
	margin-bottom: 16px;
`

export default CrossMarginTradePanelPreview

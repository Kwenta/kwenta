import { formatDollars, formatPercent } from '@kwenta/sdk/utils'
import React, { memo } from 'react'
import styled from 'styled-components'

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import PreviewArrow from 'components/PreviewArrow'
import { selectCrossMarginAvailableMargin } from 'state/futures/crossMargin/selectors'
import { selectBuyingPower, selectMarketSuspended } from 'state/futures/selectors'
import { selectPreviewMarginChange, selectTradePreview } from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

const AvailableMarginRow = memo(() => {
	const availableMargin = useAppSelector(selectCrossMarginAvailableMargin)
	const potentialTrade = useAppSelector(selectTradePreview)
	const previewTradeData = useAppSelector(selectPreviewMarginChange)
	const marketSuspended = useAppSelector(selectMarketSuspended)

	return (
		<InfoBoxRow
			title="Available Margin"
			textValue={formatDollars(availableMargin, { currencyKey: undefined })}
			textValueIcon={
				<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
					{formatDollars(previewTradeData?.availableMargin)}
				</PreviewArrow>
			}
			disabled={marketSuspended}
		/>
	)
})

const BuyingPowerRow = memo(() => {
	const potentialTrade = useAppSelector(selectTradePreview)
	const previewTradeData = useAppSelector(selectPreviewMarginChange)
	const buyingPower = useAppSelector(selectBuyingPower)
	const marketSuspended = useAppSelector(selectMarketSuspended)

	return (
		<InfoBoxRow
			title="Buying Power"
			textValue={formatDollars(buyingPower)}
			textValueIcon={
				previewTradeData?.buyingPower && (
					<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
						{formatDollars(previewTradeData?.buyingPower)}
					</PreviewArrow>
				)
			}
			disabled={marketSuspended}
		/>
	)
})

const MarketInfoBox: React.FC = memo(() => {
	return (
		<MarketInfoBoxContainer>
			<AvailableMarginRow />
			<BuyingPowerRow />
		</MarketInfoBoxContainer>
	)
})

const MarketInfoBoxContainer = styled(InfoBoxContainer)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`

export default MarketInfoBox

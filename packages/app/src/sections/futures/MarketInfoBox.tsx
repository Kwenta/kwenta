import { formatDollars, formatPercent } from '@kwenta/sdk/utils'
import React, { memo } from 'react'
import styled from 'styled-components'

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import PreviewArrow from 'components/PreviewArrow'
import {
	selectAvailableMargin,
	selectBuyingPower,
	selectMarginUsage,
	selectMarketSuspended,
	selectPreviewMarginChange,
	selectTradePreview,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

const AvailableMarginRow = memo(() => {
	const availableMargin = useAppSelector(selectAvailableMargin)
	const potentialTrade = useAppSelector(selectTradePreview)
	const previewTradeData = useAppSelector(selectPreviewMarginChange)
	const marketSuspended = useAppSelector(selectMarketSuspended)

	return (
		<InfoBoxRow
			title="Available Margin"
			textValue={formatDollars(availableMargin, { currencyKey: undefined })}
			textValueSpan={
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
			textValueSpan={
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

const MarginUsageRow = memo(() => {
	const previewTradeData = useAppSelector(selectPreviewMarginChange)
	const potentialTrade = useAppSelector(selectTradePreview)
	const marginUsage = useAppSelector(selectMarginUsage)
	const marketSuspended = useAppSelector(selectMarketSuspended)

	return (
		<InfoBoxRow
			title="Margin Usage"
			textValue={formatPercent(marginUsage)}
			textValueSpan={
				<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
					{formatPercent(previewTradeData?.marginUsage)}
				</PreviewArrow>
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
			<MarginUsageRow />
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

import { formatDollars, formatPercent } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { memo } from 'react'

import { InfoBoxRow } from 'components/InfoBox'
import { NO_VALUE } from 'constants/placeholder'

export const LiquidationRow = memo(({ liqPrice }: { liqPrice?: Wei | undefined }) => {
	return (
		<InfoBoxRow
			title="Liquidation price"
			color="preview"
			textValue={liqPrice ? formatDollars(liqPrice, { suggestDecimals: true }) : NO_VALUE}
		/>
	)
})

export const PriceImpactRow = memo(({ priceImpact }: { priceImpact: Wei | undefined }) => {
	return (
		<InfoBoxRow
			title="Price impact"
			textValue={priceImpact ? formatPercent(priceImpact) : NO_VALUE}
		/>
	)
})

export const FillPriceRow = memo(({ fillPrice }: { fillPrice: Wei | undefined }) => {
	return (
		<InfoBoxRow
			title="Fill Price"
			textValue={fillPrice ? formatDollars(fillPrice, { suggestDecimals: true }) : NO_VALUE}
		/>
	)
})

import { FuturesMarketAsset, FuturesMarketKey, PositionSide } from '@kwenta/sdk/types'
import { formatDollars } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { memo, ReactElement } from 'react'
import styled from 'styled-components'

import ColoredPrice from 'components/ColoredPrice'
import Currency from 'components/Currency'
import { PricesInfo } from 'state/prices/types'

import PositionType from '../PositionType'

type Props = {
	marketKey: FuturesMarketKey
	marketAsset?: FuturesMarketAsset
	marketName: string
	side?: PositionSide
	infoLabel?: string
	badge?: ReactElement
	price?: Wei
	priceInfo?: PricesInfo<Wei>
}

const TableMarketDetails = memo(
	({ marketKey, marketName, marketAsset, side, infoLabel, badge, price, priceInfo }: Props) => {
		return (
			<MarketContainer>
				<StyledCurrencyIcon currencyKey={marketKey} />
				<div>
					<StyledText>
						{marketName}
						{badge}
					</StyledText>
					{infoLabel && <StyledValue>{infoLabel}</StyledValue>}
					{side && <PositionType side={side} variant={'text'} />}
					{price && priceInfo && (
						<ColoredPrice priceChange={priceInfo.change}>
							{formatDollars(price, {
								suggestDecimals: true,
								suggestDecimalsForAsset: marketAsset,
							})}
						</ColoredPrice>
					)}
				</div>
			</MarketContainer>
		)
	}
)

export default TableMarketDetails

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
	margin-left: -4px;
`

const StyledText = styled.div`
	display: flex;
	align-items: center;
	grid-column: 2;
	grid-row: 1;
`

const MarketContainer = styled.div`
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
`

const StyledValue = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	grid-column: 2;
	grid-row: 2;
`

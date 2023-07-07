import styled from 'styled-components'

import { PriceChange } from 'state/prices/types'

export const getColorFromPriceInfo = (change?: PriceChange) => {
	return !change ? 'white' : change === 'up' ? 'green' : 'red'
}

const ColoredPrice = styled.div<{ priceChange?: PriceChange }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => {
		const color = getColorFromPriceInfo(props.priceChange)
		return props.theme.colors.selectedTheme[color]
	}};
`

export default ColoredPrice

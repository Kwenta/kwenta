import { PricesInfo } from 'state/prices/types'
import styled from 'styled-components'

export const getColorFromPriceInfo = (priceInfo: PricesInfo | undefined) => {
	return !priceInfo?.change ? 'white' : priceInfo.change === 'up' ? 'green' : 'red'
}

const ColoredPrice = styled.div<{ priceInfo: PricesInfo | undefined }>`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => {
		const color = getColorFromPriceInfo(props.priceInfo)
		return props.theme.colors.selectedTheme[color]
	}};
`

export default ColoredPrice

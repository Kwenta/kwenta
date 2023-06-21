import { FuturesMarketKey } from '@kwenta/sdk/types'
import { memo, ReactElement } from 'react'
import styled from 'styled-components'

import Currency from 'components/Currency'

type Props = {
	marketKey: FuturesMarketKey
	marketName: string
	infoLabel?: string
	badge?: ReactElement
}

const TableMarketDetails = memo(({ marketKey, marketName, infoLabel, badge }: Props) => {
	return (
		<MarketContainer>
			<IconContainer>
				<StyledCurrencyIcon currencyKey={marketKey} />
			</IconContainer>
			<div>
				<StyledText>
					{marketName}
					{badge}
				</StyledText>
				{infoLabel && <StyledValue>{infoLabel}</StyledValue>}
			</div>
		</MarketContainer>
	)
})

export default TableMarketDetails

const IconContainer = styled.div`
	grid-column: 1;
	grid-row: 1 / span 2;
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
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

import { FC, memo } from 'react'
import styled from 'styled-components'

import MobileBaseCurrencyCard from './MobileBaseCurrencyCard'
import MobileQuoteCurrencyCard from './MobileQuoteCurrencyCard'
import MobileSwapCurrencies from './MobileSwapCurrencies'
import RatioSelect from './RatioSelect'
import SwapButton from './SwapButton'
import SwapInfoBox from './SwapInfoBox'

const MobileSwap: FC = memo(() => (
	<MobileSwapContainer>
		<MobileQuoteCurrencyCard />
		<RatioSelect />
		<MobileSwapCurrencies />
		<MobileBaseCurrencyCard />
		<SwapInfoBox />
		<SwapButton />
	</MobileSwapContainer>
))

const MobileSwapContainer = styled.div`
	padding: 15px;
`

export default MobileSwap

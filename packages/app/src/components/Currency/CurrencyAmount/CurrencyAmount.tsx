import { formatCurrency, FormatCurrencyOptions } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { ethers } from 'ethers'
import { FC, memo } from 'react'
import styled from 'styled-components'

import { ContainerRowMixin } from 'components/layout/grid'

type WeiSource = Wei | number | string | ethers.BigNumber

type CurrencyAmountProps = {
	currencyKey: string
	amount: WeiSource
	totalValue: WeiSource
	sign?: string
	conversionRate?: WeiSource | null
	formatAmountOptions?: FormatCurrencyOptions
	formatTotalValueOptions?: FormatCurrencyOptions
	showTotalValue?: boolean
	showValue?: boolean
}

export const CurrencyAmount: FC<CurrencyAmountProps> = memo(
	({
		currencyKey,
		amount,
		totalValue,
		sign,
		conversionRate,
		formatAmountOptions = {},
		formatTotalValueOptions = {},
		showTotalValue = true,
		showValue = true,
		...rest
	}) => (
		<Container {...rest}>
			{!showValue ? null : (
				<Amount className="amount">
					{formatCurrency(currencyKey, amount, formatAmountOptions)}
				</Amount>
			)}
			{!showTotalValue ? null : (
				<TotalValue className="total-value">
					{formatCurrency(
						currencyKey,
						conversionRate != null ? wei(totalValue).div(conversionRate) : totalValue,
						{ sign, ...formatTotalValueOptions }
					)}
				</TotalValue>
			)}
		</Container>
	)
)

const Container = styled.span`
	${ContainerRowMixin};
	justify-items: end;
	font-family: ${(props) => props.theme.fonts.mono};
`

const Amount = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`
const TotalValue = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

export default CurrencyAmount

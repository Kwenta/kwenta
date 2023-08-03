import { formatCurrency, FormatCurrencyOptions } from '@kwenta/sdk/utils'
import { wei, WeiSource } from '@synthetixio/wei'
import React, { FC, memo } from 'react'
import styled from 'styled-components'

import ChangePercent from 'components/ChangePercent'
import { ContainerRowMixin } from 'components/layout/grid'
import { NumericValue } from 'components/Text'
import { CurrencyKey } from 'constants/currency'

type CurrencyPriceProps = {
	currencyKey?: CurrencyKey
	showCurrencyKey?: boolean
	price: WeiSource
	sign?: string
	change?: number
	conversionRate?: WeiSource
	formatOptions?: FormatCurrencyOptions
	colorType?: 'secondary' | 'positive' | 'negative' | 'preview'
	colored?: boolean
}

export const CurrencyPrice: FC<CurrencyPriceProps> = memo(
	({
		price,
		change,
		formatOptions,
		colorType: side,
		sign,
		currencyKey = 'sUSD',
		conversionRate = 1,
		showCurrencyKey = false,
		colored = false,
		...rest
	}) => {
		const cleanPrice = wei(price)

		return (
			<Container {...rest}>
				<NumericValue
					value={cleanPrice.div(conversionRate)}
					as="span"
					colored={colored}
					color={side}
				>
					{formatCurrency(currencyKey, cleanPrice.div(conversionRate), {
						suggestDecimals: true,
						sign: currencyKey === 'sUSD' ? '$' : sign,
						currencyKey: showCurrencyKey ? currencyKey : undefined,
						...formatOptions,
					})}
				</NumericValue>
				{!!change && <ChangePercent className="percent" value={change} />}
			</Container>
		)
	}
)

const Container = styled.span`
	${ContainerRowMixin};
`

export default CurrencyPrice

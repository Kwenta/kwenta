import { formatCurrency } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { selectInverseRate } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'

const ExchangeHead = memo(() => {
	const { t } = useTranslation()
	const { quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
	}))
	const inverseRate = useAppSelector(selectInverseRate)

	return (
		<Head>
			<title>
				{!!baseCurrencyKey && !!quoteCurrencyKey && inverseRate.gt(0)
					? t('exchange.page-title-currency-pair', {
							baseCurrencyKey,
							quoteCurrencyKey,
							rate: formatCurrency(quoteCurrencyKey, inverseRate, {
								currencyKey: quoteCurrencyKey,
							}),
					  })
					: t('exchange.page-title')}
			</title>
		</Head>
	)
})

export default ExchangeHead

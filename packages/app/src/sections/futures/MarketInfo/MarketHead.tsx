import { getDisplayAsset, formatCurrency } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { selectMarketAsset } from 'state/futures/common/selectors'
import { selectSkewAdjustedPrice } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

const MarketHead: FC = () => {
	const { t } = useTranslation()
	const marketAsset = useAppSelector(selectMarketAsset)
	const latestPrice = useAppSelector(selectSkewAdjustedPrice)
	const marketName = getDisplayAsset(marketAsset)

	return (
		<Head>
			<title>
				{latestPrice
					? t('futures.market.page-title-rate', {
							marketName,
							rate: formatCurrency('sUSD', latestPrice, {
								currencyKey: 'sUSD',
								suggestDecimals: true,
							}),
					  })
					: t('futures.market.page-title')}
			</title>
		</Head>
	)
}

export default MarketHead

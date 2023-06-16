import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { getDisplayAsset } from 'sdk/src/utils/futures';
import { formatCurrency } from 'sdk/utils/number';
import { selectMarketAsset, selectSkewAdjustedPrice } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

const MarketHead: FC = () => {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const latestPrice = useAppSelector(selectSkewAdjustedPrice);
	const marketName = getDisplayAsset(marketAsset);

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
	);
};

export default MarketHead;

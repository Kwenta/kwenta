import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { selectMarketAsset, selectMarketAssetRate } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset, isDecimalFour } from 'utils/futures';

const MarketHead: React.FC = () => {
	const { t } = useTranslation();

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const marketName = getDisplayAsset(marketAsset);

	return (
		<Head>
			<title>
				{marketAssetRate
					? t('futures.market.page-title-rate', {
							marketName,
							rate: formatCurrency('sUSD', marketAssetRate, {
								currencyKey: 'sUSD',
								minDecimals:
									marketName != null && isDecimalFour(marketName)
										? DEFAULT_CRYPTO_DECIMALS
										: undefined,
							}),
					  })
					: t('futures.market.page-title')}
			</title>
		</Head>
	);
};

export default MarketHead;

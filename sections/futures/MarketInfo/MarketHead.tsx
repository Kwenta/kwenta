import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { selectMarketAsset, selectSkewAdjustedPrice } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset, isDecimalFour } from 'utils/futures';

const MarketHead: React.FC = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const marketAsset = useAppSelector(selectMarketAsset);
	const latestPrice = useAppSelector(selectSkewAdjustedPrice);
	const marketName = getDisplayAsset(marketAsset);

	return (
		<Head>
			<title>
				{latestPrice
					? t('futures.market.page-title-rate', {
							marketName,
							rate: formatCurrency(selectedPriceCurrency.name, latestPrice, {
								currencyKey: selectedPriceCurrency.name,
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

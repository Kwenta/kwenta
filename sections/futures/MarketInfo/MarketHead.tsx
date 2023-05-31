import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { selectMarketAsset, selectSkewAdjustedPrice } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatCurrency } from 'sdk/utils/number';
import { getDisplayAsset, isDecimalFour } from 'utils/futures';

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

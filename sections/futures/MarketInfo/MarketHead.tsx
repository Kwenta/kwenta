import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { currentMarketState, marketAssetRateState } from 'store/futures';
import { formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset, isDecimalFour } from 'utils/futures';

const MarketHead: React.FC = () => {
	const { t } = useTranslation();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const baseCurrencyKey = useRecoilValue(currentMarketState);
	const basePriceRate = useRecoilValue(marketAssetRateState);

	const marketName = getDisplayAsset(baseCurrencyKey);

	return (
		<Head>
			<title>
				{basePriceRate
					? t('futures.market.page-title-rate', {
							marketName,
							rate: formatCurrency(selectedPriceCurrency.name, basePriceRate, {
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

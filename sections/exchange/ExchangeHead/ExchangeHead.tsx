import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useExchangeContext } from 'contexts/ExchangeContext';
import { baseCurrencyKeyState, quoteCurrencyKeyState } from 'store/exchange';
import { formatCurrency } from 'utils/formatters/number';

const ExchangeHead = React.memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const { inverseRate } = useExchangeContext();

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
	);
});

export default ExchangeHead;

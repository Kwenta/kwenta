import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { selectInverseRate } from 'state/exchange/selectors';
import { useAppSelector } from 'state/store';

import { baseCurrencyKeyState, quoteCurrencyKeyState } from 'store/exchange';
import { formatCurrency } from 'utils/formatters/number';

const ExchangeHead = memo(() => {
	const { t } = useTranslation();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const inverseRate = useAppSelector(selectInverseRate);

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

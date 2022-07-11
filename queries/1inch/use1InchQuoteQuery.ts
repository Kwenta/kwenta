import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { useMemo } from 'react';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import QUERY_KEYS from 'constants/queryKeys';

import Convert from 'containers/Convert';
import Connector from 'containers/Connector';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import { networkState } from 'store/wallet';

type Currency = {
	key: string;
	address: string;
};

const use1InchQuoteQuery = (
	txProvider: TxProvider | null,
	quoteCurrency: Currency | null,
	baseCurrency: Currency | null,
	amount: string,
	decimals?: number,
	options?: UseQueryOptions<string | null>
) => {
	const { quote1Inch } = Convert.useContainer();
	const network = useRecoilValue(networkState);

	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { tokensMap } = Connector.useContainer();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const synthUsdRate = useMemo(() => {
		if (!quoteCurrency || !baseCurrency) return null;
		const synth = tokensMap[quoteCurrency.key] || tokensMap[baseCurrency.key];
		if (synth) {
			return getExchangeRatesForCurrencies(exchangeRates, 'sUSD', synth.symbol);
		}
		return null;
	}, [exchangeRates, quoteCurrency, baseCurrency, tokensMap]);

	return useQuery<string | null>(
		QUERY_KEYS.Convert.quote1Inch(
			quoteCurrency?.address,
			baseCurrency?.address,
			amount,
			network?.id!
		),
		async () => {
			const sUsd = tokensMap['sUSD'];

			if (!quoteCurrency || !baseCurrency || !sUsd || !amount.length || wei(amount).eq(0)) {
				return '';
			}

			if (txProvider === '1inch') {
				const estimatedAmount = await quote1Inch(
					quoteCurrency.address!,
					baseCurrency.address,
					amount,
					decimals
				);
				return estimatedAmount;
			}

			if (tokensMap[quoteCurrency.key]) {
				const usdAmount = wei(amount).div(synthUsdRate);

				const estimatedAmount = await quote1Inch(
					sUsd.address,
					baseCurrency.address,
					usdAmount.toString(),
					decimals
				);
				return estimatedAmount;
			} else {
				const estimatedAmount = await quote1Inch(
					quoteCurrency.address,
					sUsd.address,
					amount,
					decimals
				);
				return wei(estimatedAmount).mul(synthUsdRate).toString();
			}
		},
		{
			enabled:
				!!amount?.length &&
				quoteCurrency?.address != null &&
				baseCurrency?.address != null &&
				(txProvider === '1inch' || txProvider === 'synthswap'),
			...options,
		}
	);
};

export default use1InchQuoteQuery;

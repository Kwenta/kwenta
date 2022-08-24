import { NetworkId } from '@synthetixio/contracts-interface';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import Convert from 'containers/Convert';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

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
	const { chain: network } = useNetwork();

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
			synthUsdRate || 0,
			network?.id as NetworkId
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

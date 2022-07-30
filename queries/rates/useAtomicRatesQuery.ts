import Wei, { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import {
	baseCurrencyKeyState,
	destinationCurrencyKeyState,
	isAtomicState,
	quoteCurrencyAmountWeiState,
	quoteCurrencyKeyState,
	sourceCurrencyKeyState,
} from 'store/exchange';
import { isL2State, networkState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';

import useExchangeRatesQuery from './useExchangeRatesQuery';

const useAtomicRatesQuery = (options?: UseQueryOptions<Wei | null>) => {
	const isL2 = useRecoilValue(isL2State);
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const sourceCurrencyKey = useRecoilValue(sourceCurrencyKeyState);
	const destinationCurrencyKey = useRecoilValue(destinationCurrencyKeyState);
	const quoteCurrencyAmountWei = useRecoilValue(quoteCurrencyAmountWeiState);
	const isAtomic = useRecoilValue(isAtomicState);

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const sourceAmount = quoteCurrencyAmountWei.toBN();

	return useQuery<Wei | null>(
		['rates', 'rateForAtomicExchange', sourceAmount, network.id],
		async () => {
			if (!isAtomic) {
				return newGetExchangeRatesForCurrencies(exchangeRates, quoteCurrencyKey, baseCurrencyKey);
			}

			if (sourceAmount.lte(0)) return null;

			const {
				value,
				systemSourceRate,
				systemDestinationRate,
			} = await synthetixjs!.contracts.ExchangeRates.effectiveAtomicValueAndRates(
				sourceCurrencyKey,
				sourceAmount,
				destinationCurrencyKey
			);

			return sourceAmount !== null && sourceAmount.gt(0)
				? wei(value).div(sourceAmount)
				: wei(systemSourceRate).div(systemDestinationRate);
		},
		{
			enabled:
				isAppReady && !!synthetixjs && sourceCurrencyKey != null && destinationCurrencyKey != null,
			refetchInterval: 60000,
		}
	);
};

export default useAtomicRatesQuery;

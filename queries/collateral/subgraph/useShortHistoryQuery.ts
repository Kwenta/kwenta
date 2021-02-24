import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { request } from 'graphql-request';

import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { Short } from './types';
import { shortsQuery } from './query';
import { mockShorts } from './mockShorts';
import { formatShort, SHORT_GRAPH_ENDPOINT } from './utils';

const useShortHistoryQuery = (options?: QueryConfig<Short[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	return useQuery<Short[]>(
		QUERY_KEYS.Collateral.ShortHistory(walletAddress ?? ''),
		async () => {
			if (walletAddress != null) {
				const response = await request(SHORT_GRAPH_ENDPOINT, shortsQuery, {
					account: walletAddress,
				});

				return (response?.shorts ?? []).length > 0
					? response.shorts.map((short: Partial<Short>) => ({
							...formatShort(short),
							synthBorrowedPrice: getExchangeRatesForCurrencies(
								exchangeRates,
								short.synthBorrowed as string,
								selectedPriceCurrency.name
							) as number,
							collateralLockedPrice: getExchangeRatesForCurrencies(
								exchangeRates,
								short.collateralLocked as string,
								selectedPriceCurrency.name
							) as number,
							interestAccrued: 1,
					  }))
					: mockShorts.map((short) => ({
							...formatShort(short),
							collateralLockedPrice: short.collateralLockedPrice,
							synthBorrowedPrice: short.synthBorrowedPrice,
					  }));
			} else {
				return [];
			}
		},
		{
			enabled: isAppReady && isWalletConnected,
			...options,
		}
	);
};

export default useShortHistoryQuery;

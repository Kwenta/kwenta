import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';

import Convert from 'containers/Convert';
import { wei } from '@synthetixio/wei';

const use1InchQuoteQuery = (
	quoteCurrencyAddress: string | null,
	baseCurrencyAddress: string | null,
	amount: string,
	decimals?: number,
	options?: UseQueryOptions<string | null>
) => {
	const { quote1Inch } = Convert.useContainer();
	const network = useRecoilValue(networkState);

	return useQuery<string | null>(
		QUERY_KEYS.Convert.quote1Inch(
			quoteCurrencyAddress!,
			baseCurrencyAddress!,
			amount,
			network?.id!
		),
		async () => {
			if (wei(amount).eq(0)) {
				return '';
			}

			const estimatedAmount = await quote1Inch(
				quoteCurrencyAddress!,
				baseCurrencyAddress!,
				amount,
				decimals
			);

			return estimatedAmount;
		},
		{
			enabled: quoteCurrencyAddress != null && baseCurrencyAddress != null,
			...options,
		}
	);
};

export default use1InchQuoteQuery;

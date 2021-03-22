import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';

import { CurrencyKey } from 'constants/currency';

import QUERY_KEYS from 'constants/queryKeys';

import Convert from 'containers/Convert';

const use1InchQuoteQuery = (
	quoteCurrencyKey: CurrencyKey | null,
	baseCurrencyKey: CurrencyKey | null,
	amount: string,
	options?: QueryConfig<string | null>
) => {
	const { quote1Inch } = Convert.useContainer();
	const network = useRecoilValue(networkState);

	return useQuery<string | null>(
		QUERY_KEYS.Convert.quote1Inch(quoteCurrencyKey!, baseCurrencyKey!, amount, network?.id!),
		async () => {
			const estimatedAmount = await quote1Inch(quoteCurrencyKey!, baseCurrencyKey!, amount);

			return estimatedAmount;
		},
		{
			enabled: quoteCurrencyKey != null && baseCurrencyKey != null,
			...options,
		}
	);
};

export default use1InchQuoteQuery;

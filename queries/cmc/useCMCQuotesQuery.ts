import axios from 'axios';
import zipObject from 'lodash/zipObject';
import { UseQueryOptions, useQuery } from 'react-query';

import { CurrencyKey } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';

const CMC_PRICES_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=';

type CMCSymbolQuote = {
	price: number;
	volume_24h: number;
	percent_change_1h: number;
	percent_change_24h: number;
	percent_change_7d: number;
	percent_change_30d: number;
	market_cap: number;
	last_updated: string;
};

type CMCSymbol = {
	id: number;
	name: string;
	symbol: string;
	slug: string;
	num_market_pairs: number;
	date_added: string;
	tags: string[];
	max_supply: number;
	circulating_supply: number;
	total_supply: number;
	platform: {
		id: number;
		name: string;
		symbol: string;
		slug: string;
		token_address: string;
	};
	is_active: number;
	cmc_rank: number;
	is_fiat: number;
	last_updated: string;
	quote: Record<string, CMCSymbolQuote>;
};

export type CMCPricesResponse = {
	status: {
		credit_count: number;
		elapsed: number;
		error_code: number;
		error_message: string | null;
		notice: string | null;
		timestamp: string;
	};
	data: Record<string, CMCSymbol>;
};

const useCMCQuotesQuery = (
	currencyKeys: CurrencyKey[],
	options?: UseQueryOptions<Record<string, CMCSymbolQuote>>
) => {
	return useQuery<Record<string, CMCSymbolQuote>>(
		QUERY_KEYS.CMC.Quotes(currencyKeys),
		async () => {
			const response = await axios.get<CMCPricesResponse>(CMC_PRICES_API + currencyKeys.join(','));

			return zipObject(
				currencyKeys,
				currencyKeys.map((currencyKey) => response.data.data[currencyKey.toUpperCase()].quote.USD)
			);
		},
		{
			enabled: currencyKeys.length > 0,
			...options,
		}
	);
};

export default useCMCQuotesQuery;

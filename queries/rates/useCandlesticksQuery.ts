import { Period, PERIOD_IN_HOURS } from 'constants/period';
import QUERY_KEYS from 'constants/queryKeys';
import request, { gql } from 'graphql-request';
import { UseQueryOptions, useQuery } from 'react-query';
import { Candle } from './types';
import { calculateTimestampForPeriod } from './utils';

const RATES_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-rates';

const useCandlesticksQuery = (
	currencyKey: string | null,
	period: Period = Period.ONE_DAY,
	options?: UseQueryOptions<Array<Candle>>
) => {
	const periodInHours = PERIOD_IN_HOURS[period];

	// TODO: move to data library in js monorepo once L2 branch is merged
	return useQuery<Array<Candle>>(
		QUERY_KEYS.Rates.Candlesticks(currencyKey!, period),
		async () => requestCandlesticks(currencyKey, calculateTimestampForPeriod(periodInHours)),
		{
			enabled: !!currencyKey && !!period,
			...options,
		}
	);
};

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	resolution = 'daily'
) => {
	const response = (await request(
		RATES_ENDPOINT,
		gql`
					query ${resolution}Candles($synth: String!, $minTimestamp: BigInt!, $maxTimestamp: BigInt!) {
						${resolution}Candles(
							where: { synth: $synth, timestamp_gt: $minTimestamp, timestamp_lt: $maxTimestamp }
							orderBy: id
							orderDirection: desc
						) {
							id
							synth
							open
							high
							low
							close
							timestamp
						}
					}
				`,
		{
			synth: currencyKey,
			maxTimestamp: maxTimestamp,
			minTimestamp: minTimestamp,
		}
	)) as {
		[key: string]: Array<Candle>;
	};
	return response[`${resolution}Candles`].reverse();
};

export default useCandlesticksQuery;

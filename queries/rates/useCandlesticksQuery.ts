import request, { gql } from 'graphql-request';
import { ResolutionString } from 'public/static/charting_library/charting_library';
import { Candle } from './types';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	resolution: ResolutionString,
	isL2 = false
) => {
	const RATES_ENDPOINT = isL2
		? 'https://api.thegraph.com/subgraphs/name/kwenta/optimism-latest-rates'
		: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/mainnet-main';

	const period =
		resolution === '1'
			? 60
			: resolution === '5'
			? 300
			: resolution === '15'
			? 900
			: resolution === '60'
			? 3600
			: resolution === '1D'
			? 86400
			: 3600;

	const response = request(
		RATES_ENDPOINT,
		gql`
			query candles(
				$synth: String!
				$minTimestamp: BigInt!
				$maxTimestamp: BigInt!
				$period: BigInt!
			) {
				candles(
					where: {
						synth: $synth
						timestamp_gt: $minTimestamp
						timestamp_lt: $maxTimestamp
						period: $period
					}
					orderBy: id
					orderDirection: asc
					first: 1000
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
			period: period,
		}
	).then((response) => {
		return response[`candles`] as Candle[];
	});
	return response;
};

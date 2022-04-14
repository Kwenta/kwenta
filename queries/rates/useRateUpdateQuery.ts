import request, { gql } from 'graphql-request';
import { RateUpdate } from './types';

export const useRateUpdateQuery = async (
	synth: string,
	isL2: boolean
) => {
	if (!isL2) return null

	const RATES_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main';

	try {
		const response = (await request(
			RATES_ENDPOINT,
			gql`
					query rateUpdates($synth: String!) {
						rateUpdates(
							where: { synth: $synth }
							orderBy: timestamp
							orderDirection: desc
							first: 1
						) {
							id
							currencyKey
							synth
							rate
							timestamp
						}
					}
				`,
			{
				synth: synth
			}
		))
			;
		return response;
	} catch (e) {
		console.log("query ERROR", e);
		return null;
	}
};

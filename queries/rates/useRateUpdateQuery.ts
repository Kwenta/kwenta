import request, { gql } from 'graphql-request';

export const useRateUpdateQuery = async (synth: string) => {
	if (synth === undefined) return null;

	const RATES_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main';

	try {
		const response = await request(
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
				synth: synth,
			}
		);

		let updateTime: Date = new Date();
		if (response?.rateUpdates) {
			const rateTime = response?.rateUpdates[0].timestamp;
			updateTime = new Date(parseInt(rateTime) * 1000);
		}

		return updateTime;
	} catch (e) {
		console.log('query ERROR', e);
		return null;
	}
};

import { useMemo, useState } from 'react';
import request, { gql } from 'graphql-request';

interface RateUpdate {
	baseCurrencyKey: string;
	basePriceRate: number;
}

export const useRateUpdateQuery = ({ baseCurrencyKey, basePriceRate }: RateUpdate) => {
	const synth = baseCurrencyKey;
	const [lastOracleUpdateTime, setLastOracleUpdateTime] = useState<Date>();
	const [currentRate, setCurrentRate] = useState<number>(0);

	const rateUpdateQuery = async (synth: string) => {
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

	useMemo(() => {
		if (currentRate !== basePriceRate)
			rateUpdateQuery(synth).then((response) => {
				response && setLastOracleUpdateTime(response);
			});

		setCurrentRate(basePriceRate);
	}, [synth, currentRate, basePriceRate]);

	return lastOracleUpdateTime;
};

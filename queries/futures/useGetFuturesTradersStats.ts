import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';

import { chain } from 'containers/Connector/config';
import { minTimestampState } from 'store/stats';
import logError from 'utils/logError';

import { getFuturesPositions } from './subgraph';
import { getFuturesEndpoint } from './utils';

type TradersStatMap = Record<
	string,
	{
		[account: string]: number;
	}
>;

type TradersStat = {
	date: string;
	uniqueTradersByPeriod: number;
	totalUniqueTraders: number;
};

export const useGetFuturesTradersStats = () => {
	const minTimestamp = useRecoilValue(minTimestampState);

	const query = async () => {
		try {
			const futuresEndpoint = getFuturesEndpoint(chain.optimism.id as NetworkId);
			const response = await getFuturesPositions(
				futuresEndpoint,
				{
					first: 99999,
					orderDirection: 'asc',
					orderBy: 'openTimestamp',
					where: {
						openTimestamp_gt: minTimestamp,
					},
				},
				{
					openTimestamp: true,
					account: true,
				}
			);

			const summary = response.reduce((acc: TradersStatMap, res) => {
				const date = new Date(Number(res.openTimestamp) * 1000).toISOString().split('T')[0];

				if (!acc[date]) acc[date] = {};
				if (!acc[date][res.account]) acc[date][res.account] = 0;
				acc[date][res.account] += 1;
				return acc;
			}, {});

			let cumulativeAccounts = new Set();
			const result: TradersStat[] = Object.entries(summary)
				.sort((a, b) => (new Date(a[0]) > new Date(b[0]) ? 1 : -1))
				.map(([date, accounts]) => {
					const uniqueAccounts = Object.keys(accounts);

					// set cumulative account set
					cumulativeAccounts = new Set([...cumulativeAccounts, ...uniqueAccounts]);

					// set values
					return {
						date,
						uniqueTradersByPeriod: uniqueAccounts.length,
						totalUniqueTraders: cumulativeAccounts.size,
					};
				});

			return result;
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<TradersStat[]>({
		queryKey: ['Stats', 'Traders', minTimestamp],
		queryFn: query,
	});
};

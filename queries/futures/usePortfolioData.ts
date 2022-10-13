import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import EthDater from 'ethereum-block-by-date';
import request, { gql } from 'graphql-request';
import moment from 'moment';
import { useQuery, UseQueryOptions } from 'react-query';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import logError from 'utils/logError';

import { getFuturesEndpoint } from './utils';

// @ts-ignore

type PortfolioData = {
	margin: Wei;
	block: number;
	timestamp: number;
}[];

// The chart basically plots margin against block number.

const usePortfolioData = (options?: UseQueryOptions<PortfolioData | null>) => {
	const { provider, network, walletAddress } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PortfolioData | null>(
		['futures', 'portfolio', network?.id as NetworkId, walletAddress],
		async () => {
			if (!provider || !walletAddress) return null;
			const dater = new EthDater(provider);

			const blocks = await dater.getEvery(
				'days',
				moment(Date.now()).subtract(1, 'month'),
				Date.now(),
				1,
				true,
				false
			);

			const response = await request(
				futuresEndpoint,
				gql`
					query marginAccounts($account: String!) {
						${blocks.map(
							(block: any) => gql`
								${block.block}: query futuresMarginAccounts(
									where: { account: $account },
									block: { number: ${block.block} }
								) {
									id
									timestamp
									account
									market
									asset
									margin
									deposits
									withdrawals
								}
							`
						)}
					}
				`,
				{ account: walletAddress }
			);

			logError(response);

			return [];
		},
		{ enabled: isL2, ...options }
	);
};

export default usePortfolioData;

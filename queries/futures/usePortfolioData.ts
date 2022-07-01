import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { getFuturesEndpoint } from './utils';
import EthDater from 'ethereum-block-by-date';
import moment from 'moment';
import { appReadyState } from 'store/app';
import Connector from 'containers/Connector';
import { zeroBN } from 'utils/formatters/number';

type PortfolioData = {
	margin: Wei;
	block: number;
	timestamp: number;
}[];

// The chart basically plots margin against block number.

const usePortfolioData = (options?: UseQueryOptions<PortfolioData | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const { provider } = Connector.useContainer();

	return useQuery<PortfolioData | null>(
		['futures', 'portfolio', network.id, walletAddress],
		async () => {
			if (!provider) return null;
			const dater = new EthDater(provider);

			const blocks = await dater.getEvery(
				'days',
				moment(Date.now()).subtract(1, 'month'),
				Date.now(),
				1,
				true,
				false
			);

			const res = [];

			for (const block of blocks) {
				const response = await request(
					futuresEndpoint,
					gql`
						query marginAccounts($block: Int!, $account: String!) {
							futuresMarginAccounts(where: { account: $account }, block: { number: $block }) {
								id
								timestamp
								account
								market
								asset
								margin
								deposits
								withdrawals
							}
						}
					`,
					{ block: block.block, account: walletAddress }
				);

				console.log(response);

				if (response?.futuresMarginAccounts) {
					const margin = response.futuresMarginAccounts.reduce((acc: Wei, next: any) => {
						return acc.add(wei(next.margin));
					}, zeroBN);

					res.push({ block: block.block, margin, timestamp: 0 });
				}
			}

			return res;
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default usePortfolioData;

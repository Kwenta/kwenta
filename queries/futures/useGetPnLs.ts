import { useQueries, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';
import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import request, { gql } from 'graphql-request';

const useGetPnLs = (accounts: string[], options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQueries(
		accounts.map((account) => {
			return {
				queryKey: QUERY_KEYS.Futures.PnLs(account),
				queryFn: async () => {
					const response = await request(
						FUTURES_ENDPOINT,
						gql`
							query userPnL($account: String!) {
								futuresPnLs(where: { account: $account }) {
									account
									pnl
								}
							}
						`,
						{ account: account }
					);
					0x460f0f944aa6736903cb591e89f9111ac0ca7e7b;
					0x460f0f944aa6736903cb591e89f9111ac0ca7e7b;
					console.log(response, account, 'RES');
					return {
						[account]: new Wei(response?.futuresPnLs[0]?.pnl ?? 0, 18, true),
					};
				},
				enabled: isAppReady && isL2 && !!accounts.length,
				...options,
			};
		})
	);
};

export default useGetPnLs;

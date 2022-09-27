import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { crossMarginAccountsState, futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';
import { FuturesAccountState } from './types';
import { getFuturesEndpoint } from './utils';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const [storedCrossMarginAccounts, setStoredCrossMarginAccount] = usePersistedRecoilState(
		crossMarginAccountsState
	);

	return useQuery<string | null>(
		QUERY_KEYS.Futures.CrossMarginAccount(
			walletAddress || '',
			crossMarginContractFactory?.address || ''
		),
		async () => {
			// TODO: Improve Cross margin loading states

			if (!SUPPORTED_NETWORKS.includes(String(network.id))) {
				const accountState: FuturesAccountState = {
					crossMarginAvailable: false,
					crossMarginAddress: null,
					walletAddress,
					status: 'complete',
				};
				setFuturesAccount(accountState);
				return null;
			}

			if (!crossMarginContractFactory?.address || !walletAddress) {
				setFuturesAccount({
					...futuresAccount,
					status: 'complete',
					crossMarginAddress: null,
					crossMarginAvailable: true,
					walletAddress,
				});
				return null;
			}

			const existing = crossMarginContractFactory?.address
				? storedCrossMarginAccounts[crossMarginContractFactory?.address]?.[walletAddress]
				: null;

			if (existing) {
				setFuturesAccount({
					...futuresAccount,
					status: 'complete',
					crossMarginAddress: existing,
					crossMarginAvailable: true,
					walletAddress,
				});
				return existing;
			}

			setFuturesAccount({
				...futuresAccount,
				status: 'fetching',
				crossMarginAddress: null,
				crossMarginAvailable: true,
				walletAddress,
			});

			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query crossMarginAccounts($owner: String!) {
							crossMarginAccounts(where: { owner: $owner }) {
								id
								owner
							}
						}
					`,
					{ owner: walletAddress }
				);

				const crossMarginAccount = response?.crossMarginAccounts[0]?.id || null;

				const existingAccounts = crossMarginContractFactory
					? storedCrossMarginAccounts[crossMarginContractFactory.address]
					: {};

				setStoredCrossMarginAccount({
					...storedCrossMarginAccounts,
					[crossMarginContractFactory!.address]: {
						...existingAccounts,
						[walletAddress]: crossMarginAccount,
					},
				});

				const accountState: FuturesAccountState = {
					status: 'complete',
					crossMarginAvailable: true,
					crossMarginAddress: crossMarginAccount,
					walletAddress,
				};
				setFuturesAccount(accountState);
				return crossMarginAccount;
			} catch (err) {
				logError(err);
				setFuturesAccount({
					...futuresAccount,
					status: 'error',
				});
			}
		}
	);
}

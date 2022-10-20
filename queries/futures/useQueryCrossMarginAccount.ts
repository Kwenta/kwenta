import { useCallback } from 'react';
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

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress } = Connector.useContainer();

	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const [storedCrossMarginAccounts, setStoredCrossMarginAccount] = usePersistedRecoilState(
		crossMarginAccountsState
	);

	const queryAccountFromLogs = useCallback(
		async (address: string): Promise<string | null> => {
			if (!crossMarginContractFactory) return null;
			const accountFilter = crossMarginContractFactory.filters.NewAccount(address);
			if (accountFilter) {
				const logs = await crossMarginContractFactory.queryFilter(accountFilter);
				if (logs.length) {
					return logs[0].args?.[1] || null;
				}
			}
			return null;
		},
		[crossMarginContractFactory]
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
					status: 'idle',
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
				status: futuresAccount.status === 'initial-fetch' ? 'initial-fetch' : 'refetching',
				crossMarginAddress: null,
				crossMarginAvailable: true,
				walletAddress,
			});

			try {
				const crossMarginAccount = await queryAccountFromLogs(walletAddress);

				const existingAccounts = crossMarginContractFactory
					? storedCrossMarginAccounts[crossMarginContractFactory.address]
					: {};

				if (crossMarginAccount) {
					setStoredCrossMarginAccount({
						...storedCrossMarginAccounts,
						[crossMarginContractFactory!.address]: {
							...existingAccounts,
							[walletAddress]: crossMarginAccount,
						},
					});
				}

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
				return null;
			}
		}
	);
}

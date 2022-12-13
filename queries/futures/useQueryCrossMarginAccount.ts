import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import Connector from 'containers/Connector';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { setCrossMarginAccount } from 'state/futures/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';
import { crossMarginAccountsState, futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';
import { FuturesAccountState } from './types';
import { getFuturesEndpoint } from './utils';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

const queryAccountsFromSubgraph = async (
	networkId: NetworkId,
	walletAddress: string | null
): Promise<string[]> => {
	if (!walletAddress) return [];

	const futuresEndpoint = getFuturesEndpoint(networkId);
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
	return response?.crossMarginAccounts.map((cm: { id: string }) => cm.id) || [];
};

// TODO: Clean up this state logic during redux refactor

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, signer } = Connector.useContainer();
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const [storedCrossMarginAccounts, setStoredCrossMarginAccount] = usePersistedRecoilState(
		crossMarginAccountsState
	);
	const dispatch = useAppDispatch();
	const walletAddress = useAppSelector(selectWallet);
	const [retryCount, setRetryCount] = useState(0);

	const handleAccountQuery = async () => {
		const queryAccountFromLogs = async (address: string | null): Promise<string[]> => {
			if (!signer || !crossMarginContractFactory) return [];
			const accountFilter = crossMarginContractFactory.filters.NewAccount(address);
			if (accountFilter) {
				const logs = await crossMarginContractFactory.queryFilter(accountFilter);
				if (logs.length) {
					return logs.map((l) => l.args?.[1]);
				}
			}
			return [];
		};

		const queryAccounts = async (): Promise<string[]> => {
			try {
				const accounts = await queryAccountFromLogs(walletAddress);
				return accounts;
			} catch (err) {
				// Logs query fails with some wallets so we fallback to subgraph
				return queryAccountsFromSubgraph(network.id as NetworkId, walletAddress);
			}
		};

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
			dispatch(setCrossMarginAccount(existing));
			return existing;
		}

		setFuturesAccount({
			...futuresAccount,
			status: futuresAccount.status === 'initial-fetch' ? 'initial-fetch' : 'refetching',
			crossMarginAddress: null,
			crossMarginAvailable: true,
			walletAddress,
		});

		const crossMarginAccounts = await queryAccounts();
		const crossMarginAccount = crossMarginAccounts[0];

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
		dispatch(setCrossMarginAccount(crossMarginAccount));
		return crossMarginAccount;
	};

	const queryAccount = async (throwOnError?: boolean) => {
		try {
			return await handleAccountQuery();
		} catch (err) {
			// This is a hacky workaround to deal with the delayed Metamask error
			// which causes the logs query to fail on network switching
			// https://github.com/MetaMask/metamask-extension/issues/13375#issuecomment-1046125113
			if (err.message.includes('underlying network changed') && retryCount < 5) {
				setTimeout(() => {
					setRetryCount(retryCount + 1);
				}, 500);
			} else {
				setRetryCount(0);
				logError(err);
				setFuturesAccount({
					...futuresAccount,
					status: 'error',
				});
				if (throwOnError) throw err;
				return null;
			}
		}
	};

	useEffect(() => {
		queryAccount();
		// eslint-disable-next-line
	}, [walletAddress, crossMarginContractFactory?.address]);

	useEffect(() => {
		if (retryCount) {
			queryAccount();
		}
		// eslint-disable-next-line
	}, [retryCount]);

	return queryAccount;
}

export const useStoredCrossMarginAccounts = () => {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { walletAddress } = Connector.useContainer();

	const [storedCrossMarginAccounts, setStoredCrossMarginAccount] = usePersistedRecoilState(
		crossMarginAccountsState
	);

	const existingAccounts = crossMarginContractFactory
		? storedCrossMarginAccounts[crossMarginContractFactory.address]
		: {};

	const storeCrossMarginAccount = (account: string) => {
		if (!walletAddress) return;
		setStoredCrossMarginAccount({
			...storedCrossMarginAccounts,
			[crossMarginContractFactory!.address]: {
				...existingAccounts,
				[walletAddress]: account,
			},
		});
	};

	const storedAccount =
		walletAddress && crossMarginContractFactory?.address
			? storedCrossMarginAccounts[crossMarginContractFactory?.address]?.[walletAddress]
			: null;

	return { storeCrossMarginAccount, storedAccount };
};

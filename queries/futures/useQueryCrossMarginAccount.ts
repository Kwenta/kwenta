import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import Connector from 'containers/Connector';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { crossMarginAccountsState, futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';
import { FuturesAccountState } from './types';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress, signer } = Connector.useContainer();

	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const [storedCrossMarginAccounts, setStoredCrossMarginAccount] = usePersistedRecoilState(
		crossMarginAccountsState
	);
	const [retryCount, setRetryCount] = useState(0);

	const handleAccountQuery = async () => {
		const queryAccountFromLogs = async (address: string): Promise<string | null> => {
			if (!signer || !crossMarginContractFactory) return null;
			const accountFilter = crossMarginContractFactory.filters.NewAccount(address);
			if (accountFilter) {
				const logs = await crossMarginContractFactory.queryFilter(accountFilter);
				if (logs.length) {
					return logs[0].args?.[1] || null;
				}
			}
			return null;
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
			return existing;
		}

		setFuturesAccount({
			...futuresAccount,
			status: futuresAccount.status === 'initial-fetch' ? 'initial-fetch' : 'refetching',
			crossMarginAddress: null,
			crossMarginAvailable: true,
			walletAddress,
		});

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
	};

	const queryAccount = async () => {
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

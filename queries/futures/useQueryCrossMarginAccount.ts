import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { FuturesAccountType } from 'queries/futures/types';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';
import { networkState, walletAddressState } from 'store/wallet';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';

const supportedNetworks = [69];

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();

	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);

	const queryAccountLogs = useCallback(async () => {
		if (!walletAddress || !crossMarginContractFactory) return null;
		const accountFilter = crossMarginContractFactory.filters.NewAccount(walletAddress);
		if (accountFilter) {
			const logs = await crossMarginContractFactory.queryFilter(accountFilter);
			if (logs.length) {
				return logs[0].args?.[1] || null;
			}
		}
		return null;
	}, [walletAddress, crossMarginContractFactory]);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.CrossMarginAccount(network.id, walletAddress || ''),
		async () => {
			if (!supportedNetworks.includes(network.id) || process?.env?.NODE_ENV !== 'development') {
				const accountState = {
					loading: false,
					crossMarginAvailable: false,
					crossMarginAddress: null,
					walletAddress,
					selectedFuturesAddress: walletAddress,
					selectedAccountType: 'isolated_margin' as FuturesAccountType,
				};
				setFuturesAccount(accountState);
				return accountState;
			}

			setFuturesAccount({
				...futuresAccount,
				crossMarginAddress:
					walletAddress === futuresAccount.walletAddress ? futuresAccount.crossMarginAddress : null,
				crossMarginAvailable: true,
				walletAddress,
				selectedFuturesAddress: futuresAccount?.selectedFuturesAddress,
				loading: true,
			});

			const crossMarginAccount = await queryAccountLogs();

			const accountState = {
				loading: false,
				crossMarginAvailable: true,
				crossMarginAddress: crossMarginAccount,
				walletAddress,
				selectedFuturesAddress:
					selectedAccountType === 'cross_margin' ? crossMarginAccount : walletAddress,
			};
			setFuturesAccount(accountState);
			return accountState;
		}
	);
}

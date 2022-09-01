import { NetworkId } from '@synthetixio/contracts-interface';
import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { chain } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { FuturesAccountType } from 'queries/futures/types';
import { futuresAccountState } from 'store/futures';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress } = Connector.useContainer();
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
		QUERY_KEYS.Futures.CrossMarginAccount(network?.id as NetworkId, walletAddress + 't' || ''),
		async () => {
			//TODO: Remove dev check
			if (!(network?.id === chain.optimismGoerli.id) || process?.env?.NODE_ENV !== 'development') {
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
				crossMarginAvailable: true,
				crossMarginAddress: null,
				walletAddress,
				selectedFuturesAddress: futuresAccount?.selectedFuturesAddress || walletAddress,
				selectedAccountType: futuresAccount?.selectedAccountType || 'isolated_margin',
				loading: true,
			});

			// TODO: Get selected type from persisted state

			const crossMarginAccount = await queryAccountLogs();

			const accountState = {
				loading: false,
				crossMarginAvailable: true,
				crossMarginAddress: crossMarginAccount,
				walletAddress,
				selectedFuturesAddress: crossMarginAccount || walletAddress,
				selectedAccountType: (crossMarginAccount
					? 'cross_margin'
					: 'isolated_margin') as FuturesAccountType,
			};
			setFuturesAccount(accountState);
			return accountState;
		}
	);
}

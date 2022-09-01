import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';
import { networkState, walletAddressState } from 'store/wallet';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';
import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();

	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const [selectedAccountType, setSelectedAccountType] = useRecoilState(futuresAccountTypeState);

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
		QUERY_KEYS.Futures.CrossMarginAccount(
			crossMarginContractFactory?.address || '',
			walletAddress || '',
			selectedAccountType
		),
		async () => {
			if (!SUPPORTED_NETWORKS.includes(String(network.id))) {
				const accountState = {
					ready: true,
					crossMarginAvailable: false,
					crossMarginAddress: null,
					walletAddress,
					selectedFuturesAddress: walletAddress,
				};
				setSelectedAccountType('isolated_margin');
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
			});

			const crossMarginAccount = await queryAccountLogs();

			const accountState = {
				ready: true,
				crossMarginAvailable: true,
				crossMarginAddress: crossMarginAccount,
				walletAddress,
				selectedFuturesAddress:
					selectedAccountType === 'cross_margin' ? crossMarginAccount : walletAddress,
			};
			setFuturesAccount(accountState);
			return accountState;
		},
		{ enabled: !!walletAddress }
	);
}

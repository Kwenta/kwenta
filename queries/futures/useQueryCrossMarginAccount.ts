import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress } = Connector.useContainer();
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

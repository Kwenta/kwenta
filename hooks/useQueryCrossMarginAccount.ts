import { FuturesAccountType } from 'queries/futures/types';
import { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { futuresAccountState } from 'store/futures';
import { networkState, walletAddressState } from 'store/wallet';
import useCrossMarginAccountContracts from './useCrossMarginContracts';

const supportedNetworks = [10, 69];

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();

	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);

	const queryAccountLogs = useCallback(async () => {
		if (!walletAddress || !crossMarginContractFactory) return;
		const accountFilter = crossMarginContractFactory.filters.NewAccount(walletAddress);
		if (accountFilter && crossMarginContractFactory) {
			const logs = await crossMarginContractFactory.queryFilter(accountFilter);
			if (logs.length) {
				return logs[0].args?.[1];
			}
		}
		return null;
	}, [walletAddress, crossMarginContractFactory]);

	const queryAndSetAccount = useCallback(async () => {
		console.log('querying...');
		if (!network.id || !walletAddress || !crossMarginContractFactory) return null;
		if (!supportedNetworks.includes(network.id)) {
			const accountState = {
				crossMarginAddress: null,
				walletAddress,
				selectedFuturesAddress: walletAddress,
				selectedType: 'isolated_margin' as FuturesAccountType,
			};
			setFuturesAccount(accountState);
			return accountState;
		}
		// TODO: Get selected type from persisted state

		if (walletAddress && crossMarginContractFactory) {
			setFuturesAccount({
				crossMarginAddress: null,
				walletAddress,
				selectedFuturesAddress: walletAddress,
				selectedType: futuresAccount?.selectedType || 'pending',
			});
			const crossMarginAccount = await queryAccountLogs();
			const accountState = {
				crossMarginAddress: crossMarginAccount,
				walletAddress,
				selectedFuturesAddress: crossMarginAccount || walletAddress,
				selectedType: (crossMarginAccount
					? 'cross_margin'
					: 'isolated_margin') as FuturesAccountType,
			};
			setFuturesAccount(accountState);
			return accountState;
		}
	}, [
		walletAddress,
		crossMarginContractFactory,
		futuresAccount.selectedType,
		network.id,
		setFuturesAccount,
		queryAccountLogs,
	]);

	useEffect(() => {
		queryAndSetAccount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network.id, walletAddress, crossMarginContractFactory]);

	return { queryAndSetAccount, futuresAccount };
}

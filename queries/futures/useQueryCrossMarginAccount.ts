import { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { CROSS_MARGIN_ACCOUNT_FACTORY } from 'constants/address';
import Connector from 'containers/Connector';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';
import logError from 'utils/logError';

import useCrossMarginAccountContracts from '../../hooks/useCrossMarginContracts';
import { FuturesAccountState } from './types';

const SUPPORTED_NETWORKS = Object.keys(CROSS_MARGIN_ACCOUNT_FACTORY);

export default function useQueryCrossMarginAccount() {
	const { crossMarginContractFactory } = useCrossMarginAccountContracts();
	const { network, walletAddress } = Connector.useContainer();
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

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

	const queryCrossMarginAccount = useCallback(async () => {
		if (!SUPPORTED_NETWORKS.includes(String(network.id))) {
			const accountState: FuturesAccountState = {
				crossMarginAvailable: false,
				crossMarginAddress: null,
				walletAddress,
				status: 'complete',
				selectedFuturesAddress: walletAddress,
			};
			setFuturesAccount(accountState);
			return;
		}

		setFuturesAccount({
			...futuresAccount,
			status: futuresAccount.crossMarginAddress ? 'complete' : 'fetching',
			crossMarginAddress:
				walletAddress === futuresAccount.walletAddress ? futuresAccount.crossMarginAddress : null,
			crossMarginAvailable: true,
			walletAddress,
			selectedFuturesAddress: futuresAccount?.selectedFuturesAddress,
		});

		try {
			const crossMarginAccount = await queryAccountLogs();

			const accountState: FuturesAccountState = {
				status: 'complete',
				crossMarginAvailable: true,
				crossMarginAddress: crossMarginAccount,
				walletAddress,
				selectedFuturesAddress:
					selectedAccountType === 'cross_margin' ? crossMarginAccount : walletAddress,
			};
			setFuturesAccount(accountState);
		} catch (err) {
			logError(err);
			setFuturesAccount({
				...futuresAccount,
				status: 'error',
			});
		}
	}, [
		walletAddress,
		network.id,
		futuresAccount,
		selectedAccountType,
		setFuturesAccount,
		queryAccountLogs,
	]);

	useEffect(() => {
		queryCrossMarginAccount();
		// eslint-disable-next-line
	}, [walletAddress, network.id, crossMarginContractFactory?.address]);

	return { futuresAccount, queryCrossMarginAccount };
}

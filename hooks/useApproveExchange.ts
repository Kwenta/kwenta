import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { SYNTH_SWAP_OPTIMISM_ADDRESS } from 'constants/address';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useExchangeContext } from 'contexts/ExchangeContext';
import use1InchApproveAddressQuery from 'queries/1inch/use1InchApproveAddressQuery';
import {
	approveStatusState,
	quoteCurrencyAmountState,
	quoteCurrencyKeyState,
	txErrorState,
} from 'store/exchange';
import logError from 'utils/logError';

const useApproveExchange = () => {
	const [approveStatus, setApproveStatus] = useRecoilState(approveStatusState);
	const quoteCurrencyAmount = useRecoilValue(quoteCurrencyAmountState);
	const setTxError = useSetRecoilState(txErrorState);

	const { isWalletConnected, walletAddress } = Connector.useContainer();

	const { useContractTxn } = useSynthetixQueries();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const quoteCurrencyKey = useRecoilValue(quoteCurrencyKeyState);
	const {
		txProvider,
		quoteCurrencyContract,
		needsApproval,
		setOpenModal,
		allTokensMap,
	} = useExchangeContext();

	const oneInchApproveAddressQuery = use1InchApproveAddressQuery({
		enabled: txProvider === '1inch',
	});

	const oneInchApproveAddress = oneInchApproveAddressQuery.data ?? null;

	const approveAddress =
		txProvider === '1inch' ? oneInchApproveAddress : SYNTH_SWAP_OPTIMISM_ADDRESS;

	const approveTxn = useContractTxn(
		quoteCurrencyContract,
		'approve',
		[approveAddress, ethers.constants.MaxUint256],
		undefined,
		{ enabled: !!approveAddress && !!quoteCurrencyKey && needsApproval }
	);

	useEffect(() => {
		if (approveTxn.hash) {
			monitorTransaction({
				txHash: approveTxn.hash,
				onTxConfirmed: () => {
					setApproveStatus('approved');
				},
			});
		}

		// eslint-disable-next-line
	}, [approveTxn.hash]);

	const handleApprove = useCallback(async () => {
		setTxError(null);
		setOpenModal('approve');

		try {
			await approveTxn.mutateAsync();
			setOpenModal(undefined);
		} catch (e) {
			logError(e);
			setApproveStatus('pending');
			setTxError(e.message);
		}
	}, [setTxError, approveTxn, setApproveStatus, setOpenModal]);

	const checkAllowance = useCallback(async () => {
		if (
			isWalletConnected &&
			quoteCurrencyKey != null &&
			quoteCurrencyAmount &&
			allTokensMap[quoteCurrencyKey] != null &&
			approveAddress != null
		) {
			try {
				if (quoteCurrencyContract != null) {
					const allowance = (await quoteCurrencyContract.allowance(
						walletAddress,
						approveAddress
					)) as ethers.BigNumber;
					if (wei(ethers.utils.formatEther(allowance)).gte(quoteCurrencyAmount)) {
						setApproveStatus('approved');
					}
				}
			} catch (e) {
				logError(e);
			}
		}
	}, [
		quoteCurrencyAmount,
		isWalletConnected,
		quoteCurrencyKey,
		walletAddress,
		quoteCurrencyContract,
		allTokensMap,
		approveAddress,
		setApproveStatus,
	]);

	useEffect(() => {
		if (needsApproval) {
			checkAllowance();
		}
	}, [checkAllowance, needsApproval]);

	const isApproving = useMemo(() => approveStatus === 'approving', [approveStatus]);
	const isApproved = useMemo(() => approveStatus === 'approved', [approveStatus]);

	return { isApproving, isApproved, handleApprove };
};

export default useApproveExchange;

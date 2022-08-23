import {
	TransactionStatusData,
	TransactionNotifier as BaseTN,
} from '@synthetixio/transaction-notifier';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { createContainer } from 'unstated-next';
import { useProvider } from 'wagmi';

import {
	NotificationSuccess,
	NotificationPending,
	NotificationError,
} from 'components/TransactionNotification';
import BlockExplorer from 'containers/BlockExplorer';
// import Connector from 'containers/Connector';

const useTransactionNotifier = () => {
	const { blockExplorerInstance } = BlockExplorer.useContainer();
	const provider = useProvider();

	const transactionNotifier = useMemo(() => new BaseTN(provider), [provider]);

	const monitorTransaction = ({
		txHash,
		onTxConfirmed,
		onTxFailed,
	}: {
		txHash: string;
		onTxSent?: () => void;
		onTxConfirmed?: () => void;
		onTxFailed?: (failureMessage: TransactionStatusData) => void;
	}) => {
		const link = blockExplorerInstance != null ? blockExplorerInstance.txLink(txHash) : undefined;
		if (transactionNotifier) {
			const toastProps = {
				onClick: () => window.open(link, '_blank'),
			};
			const emitter = transactionNotifier.hash(txHash);
			emitter.on('txSent', () => {
				toast(NotificationPending, { ...toastProps, toastId: txHash });
			});
			emitter.on('txConfirmed', ({ transactionHash }: TransactionStatusData) => {
				toast.update(transactionHash, {
					...toastProps,
					render: NotificationSuccess,
					autoClose: 10000,
				});
				if (onTxConfirmed != null) {
					onTxConfirmed();
				}
			});
			emitter.on('txFailed', ({ transactionHash, failureReason }: TransactionStatusData) => {
				toast.update(transactionHash, {
					...toastProps,
					render: <NotificationError failureReason={failureReason} />,
				});
				if (onTxFailed != null) {
					onTxFailed({ transactionHash, failureReason });
				}
			});
		}
	};
	return { monitorTransaction };
};

const TransactionNotifier = createContainer(useTransactionNotifier);

export default TransactionNotifier;

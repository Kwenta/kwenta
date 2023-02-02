import { TransactionStatusData } from '@synthetixio/transaction-notifier';
import { toast } from 'react-toastify';

import {
	NotificationSuccess,
	NotificationPending,
	NotificationError,
} from 'components/TransactionNotification';
import { blockExplorer, transactionNotifier } from 'containers/Connector/Connector';

export const monitorTransaction = ({
	txHash,
	onTxConfirmed,
	onTxFailed,
}: {
	txHash: string;
	onTxSent?: () => void;
	onTxConfirmed?: () => void;
	onTxFailed?: (failureMessage: TransactionStatusData) => void;
}) => {
	const link = blockExplorer.txLink(txHash);

	const toastProps = {
		onClick: () => window.open(link, '_blank'),
		containerId: 'notifications',
	};
	const emitter = transactionNotifier.hash(txHash);
	emitter.on('txSent', () => {
		toast(NotificationPending, { ...toastProps, toastId: txHash });
	});
	emitter.on('txConfirmed', ({ transactionHash }) => {
		toast.update(transactionHash, {
			...toastProps,
			render: NotificationSuccess,
			autoClose: 10000,
		});
		if (onTxConfirmed != null) {
			onTxConfirmed();
		}
	});
	emitter.on('txFailed', ({ transactionHash, failureReason }) => {
		toast.update(transactionHash, {
			...toastProps,
			render: <NotificationError failureReason={failureReason} />,
		});
		if (onTxFailed != null) {
			onTxFailed({ transactionHash, failureReason });
		}
	});
};

import { wei } from '@synthetixio/wei';
import { constants } from 'ethers';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';
import { CROSS_MARGIN_BASE_SETTINGS } from 'constants/address';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useQueryCrossMarginAccount from 'hooks/useQueryCrossMarginAccount';
import useSUSDContract from 'hooks/useSUSDContract';
import { futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

type Props = {
	isOpen: boolean;
	onClose: () => any;
	onComplete?: () => void;
};

export default function CrossMarginOnboard({ onClose, onComplete, isOpen }: Props) {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthetixjs, signer, network } = Connector.useContainer();
	const {
		crossMarginAccountContract,
		crossMarginContractFactory,
	} = useCrossMarginAccountContracts();
	const susdContract = useSUSDContract();
	const { queryAndSetAccount } = useQueryCrossMarginAccount();

	const futuresAccount = useRecoilValue(futuresAccountState);
	const [depositAmount, setDepositAmount] = useState('');
	const [depositComplete, setDepositComplete] = useState(false);
	const [creatingAccount, setCreatingAccount] = useState(false);

	const { handleRefetch } = useRefetchContext();

	const createAccount = async () => {
		try {
			if (!signer || !synthetixjs || !crossMarginContractFactory)
				throw new Error('Signer or snx lib missing');

			const crossMarginSettingsAddress = CROSS_MARGIN_BASE_SETTINGS[String(network.id)];

			if (!crossMarginSettingsAddress) throw new Error('Unsupported network');

			setCreatingAccount(true);
			const tx = await crossMarginContractFactory.newAccount();
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: async () => {
					try {
						queryAndSetAccount();
					} catch (err) {
						logError(err);
					} finally {
						setCreatingAccount(false);
					}
				},
				onTxFailed: () => {
					setCreatingAccount(false);
				},
			});
		} catch (err) {
			setCreatingAccount(false);
			logError(err);
		}
	};

	const submitDeposit = async (weiAmount: string) => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross margin account');

			const tx = await crossMarginAccountContract.deposit(weiAmount);
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: () => {
					onDepositComplete();
				},
			});
		} catch (err) {
			logError(err);
		}
	};

	const depositToAccount = async () => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross margin account');
			const weiAmount = wei(depositAmount ?? 0, 18);
			const weiAmountString = weiAmount.toString(18, true);
			const wallet = await signer?.getAddress();
			const allowance = await susdContract?.allowance(wallet, crossMarginAccountContract.address);

			if (wei(allowance).lt(weiAmount)) {
				const tx = await susdContract?.approve(
					crossMarginAccountContract.address,
					constants.MaxUint256
				);
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						submitDeposit(weiAmountString);
					},
				});
			} else {
				submitDeposit(weiAmountString);
			}
		} catch (err) {
			logError(err);
		}
	};

	const onEditAmount = (_: ChangeEvent<HTMLInputElement>, value: string) => {
		setDepositAmount(value);
	};

	const onDepositComplete = () => {
		setDepositComplete(true);
		handleRefetch('account-margin-change');
		onComplete?.();
		onClose();
	};

	const renderContent = () => {
		if (futuresAccount && !futuresAccount.crossMarginAvailable) {
			return <ErrorView message="Cross margin is not supported on this network" />;
		}
		if (creatingAccount || !futuresAccount || futuresAccount?.selectedAccountType === 'pending') {
			return <Loader />;
		}

		if (futuresAccount?.crossMarginAddress && depositComplete) {
			return <OpenAccountButton onClick={onClose}>Done</OpenAccountButton>;
		}

		if (futuresAccount?.crossMarginAddress) {
			return (
				<>
					<NumericInput placeholder="0.00" value={depositAmount} onChange={onEditAmount} />
					<OpenAccountButton onClick={depositToAccount}>Deposit sUSD</OpenAccountButton>
				</>
			);
		}

		return <OpenAccountButton onClick={createAccount}>Create Account</OpenAccountButton>;
	};

	return (
		<StyledBaseModal onDismiss={onClose} isOpen={isOpen} title={t('futures.modals.onboard.title')}>
			{renderContent()}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-body {
		padding: 28px;
	}
`;

const OpenAccountButton = styled(Button)`
	margin-top: 24px;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`;

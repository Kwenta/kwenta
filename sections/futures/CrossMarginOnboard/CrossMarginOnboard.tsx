import { wei } from '@synthetixio/wei';
import { constants } from 'ethers';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import CompleteCheck from 'assets/svg/futures/onboard-complete-check.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import InputBalanceLabel from 'components/Input/InputBalanceLabel';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';
import ProgressSteps from 'components/ProgressSteps';
import { CROSS_MARGIN_BASE_SETTINGS } from 'constants/address';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useSUSDContract from 'hooks/useSUSDContract';
import { balancesState, futuresAccountState } from 'store/futures';
import { walletAddressState } from 'store/wallet';
import { FlexDivRowCentered } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import CrossMarginFAQ from './CrossMarginFAQ';

type Props = {
	isOpen: boolean;
	onClose: () => any;
};

export default function CrossMarginOnboard({ onClose, isOpen }: Props) {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { synthetixjs, network } = Connector.useContainer();
	const {
		crossMarginAccountContract,
		crossMarginContractFactory,
	} = useCrossMarginAccountContracts();
	const susdContract = useSUSDContract();
	const { handleRefetch } = useRefetchContext();

	const futuresAccount = useRecoilValue(futuresAccountState);
	const balances = useRecoilValue(balancesState);
	const wallet = useRecoilValue(walletAddressState);

	const [depositAmount, setDepositAmount] = useState('');
	const [depositComplete, setDepositComplete] = useState(false);
	const [submitting, setSubmitting] = useState<null | 'approve' | 'create' | 'deposit'>(null);
	const [allowance, setAllowance] = useState(zeroBN);

	const susdBal = balances?.susdWalletBalance;

	const fetchAllowance = useCallback(async () => {
		if (!crossMarginAccountContract || !susdContract || !wallet) return;
		try {
			const allowance = await susdContract.allowance(wallet, crossMarginAccountContract.address);
			setAllowance(wei(allowance));
		} catch (err) {
			logError(err);
		}
	}, [crossMarginAccountContract, susdContract, wallet]);

	useEffect(() => {
		fetchAllowance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [crossMarginAccountContract?.address, wallet]);

	const createAccount = useCallback(async () => {
		try {
			if (!synthetixjs || !crossMarginContractFactory) throw new Error('Signer or snx lib missing');

			const crossMarginSettingsAddress = CROSS_MARGIN_BASE_SETTINGS[String(network.id)];

			if (!crossMarginSettingsAddress) throw new Error('Unsupported network');

			setSubmitting('create');
			const tx = await crossMarginContractFactory.newAccount();
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: async () => {
					try {
						handleRefetch('cross-margin-account-change', 1000);
					} catch (err) {
						logError(err);
					} finally {
						setSubmitting(null);
					}
				},
				onTxFailed: () => {
					setSubmitting(null);
				},
			});
		} catch (err) {
			setSubmitting(null);
			logError(err);
		}
	}, [
		synthetixjs,
		crossMarginContractFactory,
		network,
		handleRefetch,
		setSubmitting,
		monitorTransaction,
	]);

	const submitDeposit = useCallback(
		async (weiAmount: string) => {
			try {
				if (!crossMarginAccountContract) throw new Error('No cross-margin account');
				setSubmitting('deposit');
				const tx = await crossMarginAccountContract.deposit(weiAmount);
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: () => {
						setSubmitting(null);
						setDepositComplete(true);
						handleRefetch('account-margin-change');
					},
				});
			} catch (err) {
				setSubmitting(null);
				logError(err);
			}
		},
		[crossMarginAccountContract, monitorTransaction, handleRefetch]
	);

	const onClickApprove = useCallback(async () => {
		try {
			if (!crossMarginAccountContract || !susdContract)
				throw new Error('Smart contracts not initialized');
			setSubmitting('approve');
			const tx = await susdContract.approve(
				crossMarginAccountContract.address,
				constants.MaxUint256
			);
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: () => {
					setSubmitting(null);
					fetchAllowance();
				},
			});
		} catch (err) {
			setSubmitting(null);
			logError(err);
		}
	}, [crossMarginAccountContract, susdContract, monitorTransaction, fetchAllowance]);

	const depositToAccount = useCallback(async () => {
		try {
			if (!crossMarginAccountContract || !susdContract)
				throw new Error('Smart contracts not initialized');
			const weiAmount = wei(depositAmount ?? 0, 18);
			const weiAmountString = weiAmount.toString(18, true);
			submitDeposit(weiAmountString);
		} catch (err) {
			logError(err);
		}
	}, [crossMarginAccountContract, depositAmount, susdContract, submitDeposit]);

	const onEditAmount = (_: ChangeEvent<HTMLInputElement>, value: string) => {
		setDepositAmount(value);
	};

	const renderProgress = (step: number, complete?: boolean) => {
		return (
			<ProgressContainer>
				<ProgressSteps step={step} totalSteps={3} complete={complete} />
			</ProgressContainer>
		);
	};

	const renderContent = () => {
		if (futuresAccount && !futuresAccount.crossMarginAvailable) {
			return <ErrorView message={t('futures.modals.onboard.unsupported-network')} />;
		}
		if (!futuresAccount || !futuresAccount.ready) {
			return <Loader />;
		}

		if (depositComplete) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step3-complete')}</Intro>
					<Complete>
						<CompleteCheck />
					</Complete>
					{renderProgress(3, true)}
					<StyledButton variant="flat" onClick={onClose}>
						Done
					</StyledButton>
				</>
			);
		}

		if (futuresAccount?.crossMarginAddress && allowance.eq(0)) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step2-intro')}</Intro>
					<FAQs>
						<FAQHeader>FAQ:</FAQHeader>
						<CrossMarginFAQ />
					</FAQs>
					{renderProgress(2)}
					<StyledButton variant="flat" onClick={onClickApprove}>
						{submitting === 'approve' ? <Loader /> : 'Approve'}
					</StyledButton>
				</>
			);
		}

		if (futuresAccount?.crossMarginAddress) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step3-intro')}</Intro>
					<InputBalanceLabel balance={susdBal || zeroBN} currencyKey="sUSD" />
					<NumericInput placeholder="0.00" value={depositAmount} onChange={onEditAmount} />
					{renderProgress(3)}
					<StyledButton variant="flat" onClick={depositToAccount}>
						{submitting === 'deposit' ? <Loader /> : 'Deposit sUSD'}
					</StyledButton>
				</>
			);
		}

		return (
			<>
				<Intro>{t('futures.modals.onboard.step1-intro')}</Intro>
				<FAQs>
					<FAQHeader>FAQ:</FAQHeader>
					<CrossMarginFAQ />
				</FAQs>
				{renderProgress(1)}
				<StyledButton noOutline onClick={createAccount}>
					{submitting === 'create' ? <Loader /> : 'Create Account'}
				</StyledButton>
			</>
		);
	};

	return (
		<StyledBaseModal onDismiss={onClose} isOpen={isOpen} title={t('futures.modals.onboard.title')}>
			{renderContent()}
		</StyledBaseModal>
	);
}

const StyledBaseModal = styled(BaseModal)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

const StyledButton = styled(Button)`
	margin-top: 24px;
	height: 50px;
	width: 100%;
`;

const FAQs = styled.div``;

const FAQHeader = styled.div`
	padding-bottom: 4px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	margin-bottom: 5px;
`;

const ProgressContainer = styled.div`
	margin-top: 30px;
`;

const Intro = styled.div`
	margin-bottom: 30px;
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

const Complete = styled.div`
	padding: 40px;
	text-align: center;
`;

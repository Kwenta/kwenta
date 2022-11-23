import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { constants } from 'ethers';
import { hexStripZeros } from 'ethers/lib/utils';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
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
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import Connector from 'containers/Connector';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useSUSDContract from 'hooks/useSUSDContract';
import { FuturesAccountState } from 'queries/futures/types';
import useQueryCrossMarginAccount, {
	useStoredCrossMarginAccounts,
} from 'queries/futures/useQueryCrossMarginAccount';
import { balancesState, futuresAccountState } from 'store/futures';
import { FlexDivRowCentered } from 'styles/common';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import CrossMarginFAQ from './CrossMarginFAQ';

type Props = {
	isOpen: boolean;
	onClose: () => any;
};

const MAX_REFETCH_COUNT = 20;
export const CREATE_ACCOUNT_GAS_LIMIT = 230000;

export default function CrossMarginOnboard({ onClose, isOpen }: Props) {
	const { t } = useTranslation();
	const {
		defaultSynthetixjs: synthetixjs,
		network,
		walletAddress,
		provider,
	} = Connector.useContainer();
	const {
		crossMarginAccountContract,
		crossMarginContractFactory,
	} = useCrossMarginAccountContracts();
	const susdContract = useSUSDContract();
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();
	const queryCrossMarginAccount = useQueryCrossMarginAccount();
	const { storeCrossMarginAccount } = useStoredCrossMarginAccounts();
	const [futuresAccount, setFuturesAccount] = useRecoilState(futuresAccountState);
	const balances = useRecoilValue(balancesState);

	const [depositAmount, setDepositAmount] = useState('');
	const [depositComplete, setDepositComplete] = useState(false);
	const [submitting, setSubmitting] = useState<null | 'approve' | 'create' | 'deposit'>(null);
	const [allowance, setAllowance] = useState(zeroBN);
	const [error, setError] = useState<string | null>(null);

	const susdBal = balances?.susdWalletBalance;

	const isDepositDisabled = useMemo(() => {
		if (!depositAmount) return true;

		return wei(depositAmount).lt(MIN_MARGIN_AMOUNT);
	}, [depositAmount]);

	const fetchAllowance = useCallback(async () => {
		if (!crossMarginAccountContract || !susdContract || !walletAddress) return;
		try {
			const allowanceBN = await susdContract.allowance(
				walletAddress,
				crossMarginAccountContract.address
			);
			const allowanceWei = wei(allowanceBN);
			setAllowance(allowanceWei);
			return allowanceWei;
		} catch (err) {
			logError(err);
		}
	}, [crossMarginAccountContract, susdContract, walletAddress]);

	useEffect(() => {
		fetchAllowance();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [crossMarginAccountContract?.address, walletAddress]);

	useEffect(() => {
		if (futuresAccount?.crossMarginAddress) {
			// Only re-enable the button when account has been created
			setSubmitting(null);
		}
	}, [futuresAccount?.crossMarginAddress]);

	const createAccount = useCallback(async () => {
		setError(null);
		if (submitting) return;
		setSubmitting('create');
		try {
			if (!synthetixjs || !crossMarginContractFactory) throw new Error('Signer or snx lib missing');

			const crossMarginSettingsAddress =
				CROSS_MARGIN_BASE_SETTINGS[String(network?.id as NetworkId)];

			if (!crossMarginSettingsAddress) throw new Error('Unsupported network');
			const existing = await queryCrossMarginAccount(true);
			if (existing) {
				// This is a safety measure in the case a user gets
				// into this flow when they already have an account
				setSubmitting(null);
				return;
			}

			const tx = await crossMarginContractFactory.newAccount({
				gasLimit: CREATE_ACCOUNT_GAS_LIMIT,
			});

			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: async () => {
					try {
						const receipt = await provider.getTransactionReceipt(tx.hash);
						const log = receipt?.logs.find((l) => l.address === crossMarginContractFactory.address);
						if (log?.data) {
							const account = hexStripZeros(log.data);
							storeCrossMarginAccount(account);
							const accountState: FuturesAccountState = {
								status: 'complete',
								crossMarginAvailable: true,
								crossMarginAddress: account,
								walletAddress,
							};
							setFuturesAccount(accountState);
						}
					} catch (err) {
						logError(err);
						// Fallback to querying logs and subgraph if tx not available
						try {
							await refetchUntilUpdate('cross-margin-account-change');
						} catch (err) {
							logError(err);
							setSubmitting(null);
						}
					}
				},
				onTxFailed: () => {
					setSubmitting(null);
				},
			});
		} catch (err) {
			if (!isUserDeniedError(err.message)) {
				setError('Failed to create account');
				logError(err);
			}
			setSubmitting(null);
		}
	}, [
		synthetixjs,
		crossMarginContractFactory,
		network,
		submitting,
		provider,
		walletAddress,
		storeCrossMarginAccount,
		setFuturesAccount,
		setSubmitting,
		refetchUntilUpdate,
		queryCrossMarginAccount,
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
		[crossMarginAccountContract, handleRefetch]
	);

	const fetchUntilAllowance = useCallback(async () => {
		let count = 0;
		return new Promise(async (res, rej) => {
			const refetchAllowance = async () => {
				const fetchedAllowance = await fetchAllowance();
				if (fetchedAllowance?.eq(0) && count < MAX_REFETCH_COUNT) {
					setTimeout(() => {
						count++;
						refetchAllowance();
					}, 1000);
				} else if (count === MAX_REFETCH_COUNT) {
					rej(new Error('Timeout fetching allowance'));
				} else {
					res(fetchedAllowance);
				}
			};
			refetchAllowance();
		});
	}, [fetchAllowance]);

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
				onTxConfirmed: async () => {
					try {
						await fetchUntilAllowance();
						setSubmitting(null);
					} catch (err) {
						setSubmitting(null);
						logError(err);
					}
				},
			});
		} catch (err) {
			setSubmitting(null);
			logError(err);
		}
	}, [crossMarginAccountContract, susdContract, fetchUntilAllowance]);

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
		if (!futuresAccount || futuresAccount.status === 'initial-fetch') {
			return (
				<LoaderContainer>
					<Loader />
				</LoaderContainer>
			);
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
					<StyledButton variant="flat" onClick={onClickApprove} disabled={!!submitting}>
						{submitting === 'approve' ? <Loader /> : 'Approve'}
					</StyledButton>
				</>
			);
		}

		if (futuresAccount?.crossMarginAddress) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step3-intro')}</Intro>
					<InputBalanceLabel
						balance={susdBal || zeroBN}
						currencyKey="sUSD"
						onSetAmount={setDepositAmount}
					/>
					<NumericInput placeholder="0.00" value={depositAmount} onChange={onEditAmount} />
					{renderProgress(3)}
					{isDepositDisabled && (
						<MinimumAmountDisclaimer>
							{t('futures.market.trade.margin.modal.deposit.disclaimer')}
						</MinimumAmountDisclaimer>
					)}
					<StyledButton
						disabled={isDepositDisabled || !!submitting}
						variant="flat"
						textTransform="none"
						onClick={depositToAccount}
					>
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
				<StyledButton noOutline onClick={createAccount} disabled={!!submitting}>
					{submitting === 'create' ? <Loader /> : 'Create Account'}
				</StyledButton>
			</>
		);
	};

	return (
		<StyledBaseModal onDismiss={onClose} isOpen={isOpen} title={t('futures.modals.onboard.title')}>
			{renderContent()}
			{error && <ErrorView message={error} containerStyle={{ marginTop: '20px' }} />}
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

const LoaderContainer = styled.div`
	height: 120px;
`;

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`;

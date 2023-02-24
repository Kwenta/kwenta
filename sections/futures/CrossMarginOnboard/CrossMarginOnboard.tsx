import { wei } from '@synthetixio/wei';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CompleteCheck from 'assets/svg/futures/onboard-complete-check.svg';
import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { notifyError } from 'components/ErrorView/ErrorNotifier';
import InputBalanceLabel from 'components/Input/InputBalanceLabel';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';
import ProgressSteps from 'components/ProgressSteps';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import Connector from 'containers/Connector';
import { monitorTransaction } from 'contexts/RelayerContext';
import { selectBalances } from 'state/balances/selectors';
import { sdk } from 'state/config';
import { approveCrossMargin, depositCrossMargin } from 'state/futures/actions';
import { setCrossMarginAccount } from 'state/futures/reducer';
import {
	selectCMAccountQueryStatus,
	selectCMBalance,
	selectCMDepositApproved,
	selectCrossMarginAccount,
	selectFuturesSupportedNetwork,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import CrossMarginFAQ from './CrossMarginFAQ';

type Props = {
	isOpen: boolean;
	onClose: () => any;
};

export default function CrossMarginOnboard({ onClose, isOpen }: Props) {
	const { t } = useTranslation();
	const { provider } = Connector.useContainer();
	const dispatch = useAppDispatch();
	const balances = useAppSelector(selectBalances);
	const crossMarginAvailable = useAppSelector(selectFuturesSupportedNetwork);
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount);
	const queryStatus = useAppSelector(selectCMAccountQueryStatus);
	const depositApproved = useAppSelector(selectCMDepositApproved);
	const txProcessing = useAppSelector(selectSubmittingFuturesTx);
	const crossMarginBalance = useAppSelector(selectCMBalance);
	const walletAddress = useAppSelector(selectWallet);
	const network = useAppSelector(selectNetwork);

	const [depositAmount, setDepositAmount] = useState('');
	const [submitting, setSubmitting] = useState<null | 'create'>(null);

	const susdBal = balances?.susdWalletBalance;

	const isDepositDisabled = useMemo(() => {
		if (!depositAmount) return true;

		return wei(depositAmount).lt(MIN_MARGIN_AMOUNT);
	}, [depositAmount]);

	useEffect(() => {
		if (crossMarginAccount) {
			// Only re-enable the button when account has been created
			setSubmitting(null);
		}
	}, [crossMarginAccount]);

	const createAccount = useCallback(async () => {
		if (submitting) return;
		setSubmitting('create');
		try {
			const existing = await sdk.futures.getCrossMarginAccounts(walletAddress);
			if (existing?.length) {
				if (!walletAddress) return;
				dispatch(setCrossMarginAccount({ account: existing[0], wallet: walletAddress, network }));
				// This is a safety measure in the case a user gets
				// into this flow when they already have an account
				setSubmitting(null);
				return;
			}

			const tx = await sdk.futures.createCrossMarginAccount();
			if (tx) {
				monitorTransaction({
					txHash: tx.hash,
					onTxConfirmed: async () => {
						try {
							const receipt = await provider.getTransactionReceipt(tx.hash);
							const log = receipt?.logs.find(
								(l) => l.address === sdk.context.contracts.CrossMarginAccountFactory?.address
							);
							if (log?.data && walletAddress) {
								const account = defaultAbiCoder.decode(['address'], log.data)[0];
								dispatch(
									setCrossMarginAccount({ account: account, wallet: walletAddress, network })
								);
							}
						} catch (err) {
							logError(err);
							// Fallback to querying logs if tx not available
							try {
								const addresses = await sdk.futures.getCrossMarginAccounts(walletAddress);
								if (addresses.length && walletAddress) {
									dispatch(
										setCrossMarginAccount({ account: existing[0], wallet: walletAddress, network })
									);
								}
								setSubmitting(null);
							} catch (err) {
								notifyError('Failed to fetch account after the transaction completed', err);
								logError(err);
								setSubmitting(null);
							}
						}
					},
					onTxFailed: () => {
						setSubmitting(null);
					},
				});
			}
		} catch (err) {
			if (!isUserDeniedError(err.message)) {
				notifyError('Failed to create account', err);
				logError(err);
			}
			setSubmitting(null);
		}
	}, [network, submitting, provider, walletAddress, dispatch, setSubmitting]);

	const onClickApprove = useCallback(async () => {
		dispatch(approveCrossMargin());
	}, [dispatch]);

	const depositToAccount = useCallback(async () => {
		try {
			const weiAmount = wei(depositAmount);
			dispatch(depositCrossMargin(weiAmount));
		} catch (err) {
			logError(err);
		}
	}, [depositAmount, dispatch]);

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
		if (!crossMarginAvailable) {
			return <ErrorView message={t('futures.modals.onboard.unsupported-network')} />;
		}
		if (!crossMarginAccount && queryStatus.status === FetchStatus.Loading) {
			return (
				<LoaderContainer>
					<Loader />
				</LoaderContainer>
			);
		}

		if (depositApproved && crossMarginBalance.gt(0)) {
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

		if (crossMarginAccount && !depositApproved) {
			return (
				<>
					<Intro>{t('futures.modals.onboard.step2-intro')}</Intro>
					<div>
						<FAQHeader>FAQ:</FAQHeader>
						<CrossMarginFAQ />
					</div>
					{renderProgress(2)}
					<StyledButton variant="flat" onClick={onClickApprove} disabled={txProcessing}>
						{txProcessing ? <Loader /> : 'Approve'}
					</StyledButton>
				</>
			);
		}

		if (crossMarginAccount) {
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
						disabled={isDepositDisabled || txProcessing}
						variant="flat"
						textTransform="none"
						onClick={depositToAccount}
					>
						{txProcessing ? <Loader /> : 'Deposit sUSD'}
					</StyledButton>
				</>
			);
		}

		return (
			<>
				<Intro>{t('futures.modals.onboard.step1-intro')}</Intro>
				<div>
					<FAQHeader>FAQ:</FAQHeader>
					<CrossMarginFAQ />
				</div>
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

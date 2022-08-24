import { wei } from '@synthetixio/wei';
import { constants } from 'ethers';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useRefetchContext } from 'contexts/RefetchContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useSUSDContract from 'hooks/useSUSDContract';
import { balancesState, crossMarginAvailableMarginState } from 'store/futures';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

type DepositMarginModalProps = {
	onDismiss(): void;
	onComplete?(): void;
};

const PLACEHOLDER = '$0.00';
const MIN_DEPOSIT_AMOUNT = wei('50');

export default function DepositWithdrawCrossMargin({
	onDismiss,
	onComplete,
}: DepositMarginModalProps) {
	const { t } = useTranslation();
	const { signer } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const susdContract = useSUSDContract();

	const balances = useRecoilValue(balancesState);
	const freeMargin = useRecoilValue(crossMarginAvailableMarginState);

	const [amount, setAmount] = useState<string>('');
	const [transferType, setTransferType] = useState(0);
	const [txState, setTxState] = useState<'none' | 'approving' | 'submitting' | 'complete'>('none');
	const [error, setError] = useState<string | null>(null);

	const { handleRefetch } = useRefetchContext();

	const susdBal = transferType === 0 ? balances?.susdWalletBalance || zeroBN : freeMargin;

	const submitDeposit = useCallback(async () => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross-margin account');

			setTxState('submitting');
			const tx = await crossMarginAccountContract.deposit(wei(amount).toBN());
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: () => {
					setTxState('complete');
					handleRefetch('account-margin-change');
					onComplete?.();
					onDismiss();
				},
			});
		} catch (err) {
			setError(err.message);
			setTxState('none');
			logError(err);
		}
	}, [
		crossMarginAccountContract,
		amount,
		monitorTransaction,
		handleRefetch,
		onComplete,
		onDismiss,
	]);

	const depositMargin = useCallback(async () => {
		try {
			const wallet = await signer?.getAddress();

			if (!crossMarginAccountContract || !wallet) throw new Error('No cross margin account');
			const weiAmount = wei(amount ?? 0, 18);
			const allowance = await susdContract?.allowance(wallet, crossMarginAccountContract.address);

			if (wei(allowance).lt(weiAmount)) {
				setTxState('approving');
				const tx = await susdContract?.approve(
					crossMarginAccountContract.address,
					constants.MaxUint256
				);
				if (tx?.hash) {
					monitorTransaction({
						txHash: tx.hash,
						onTxConfirmed: () => {
							submitDeposit();
						},
					});
				}
			} else {
				submitDeposit();
			}
		} catch (err) {
			setError(err.message);
			setTxState('none');
			logError(err);
		}
	}, [crossMarginAccountContract, amount, signer, susdContract, monitorTransaction, submitDeposit]);

	const withdrawMargin = useCallback(async () => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross-margin account');
			setTxState('submitting');
			const tx = await crossMarginAccountContract.withdraw(wei(amount).toBN());
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: () => {
					setTxState('complete');
					handleRefetch('account-margin-change');
					onComplete?.();
					onDismiss();
				},
			});
		} catch (err) {
			setError(err.message);
			setTxState('none');
			logError(err);
		}
	}, [
		crossMarginAccountContract,
		amount,
		monitorTransaction,
		handleRefetch,
		onComplete,
		onDismiss,
	]);

	// TODO: Get tx fee
	const transactionFee = wei('0.1');

	const disabledReason = useMemo(() => {
		const amtWei = wei(amount || 0);
		if (transferType === 0) {
			const total = wei(freeMargin).add(amtWei);
			if (total.lt(MIN_DEPOSIT_AMOUNT))
				return t('futures.market.trade.margin.modal.deposit.min-deposit');
			if (amtWei.gt(susdBal)) return t('futures.market.trade.margin.modal.deposit.exceeds-balance');
		} else {
			if (amtWei.gt(freeMargin))
				return t('futures.market.trade.margin.modal.deposit.exceeds-balance');
		}
	}, [amount, freeMargin, transferType, susdBal, t]);

	const handleSetMax = React.useCallback(() => {
		setAmount(susdBal.toString());
	}, [susdBal]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		setAmount('');
	};

	return (
		<StyledBaseModal
			title={t(
				`futures.market.trade.margin.modal.${transferType === 0 ? 'deposit' : 'withdraw'}.title`
			)}
			isOpen
			onDismiss={onDismiss}
		>
			<StyledSegmentedControl
				values={['Deposit', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(susdBal)}</span> sUSD
				</BalanceText>
			</BalanceContainer>

			<InputContainer
				dataTestId="futures-market-trade-deposit-margin-input"
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>

			<GasFeeContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.gas-fee')}:</BalanceText>
				<BalanceText>
					<span>{transactionFee ? formatDollars(transactionFee) : NO_VALUE}</span>
				</BalanceText>
			</GasFeeContainer>

			<MarginActionButton
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={!!disabledReason || !amount || txState !== 'none'}
				fullWidth
				onClick={transferType === 0 ? depositMargin : withdrawMargin}
			>
				{txState === 'approving' || txState === 'submitting' ? (
					<Loader />
				) : (
					disabledReason ||
					t(
						`futures.market.trade.margin.modal.${
							transferType === 0 ? 'deposit' : 'withdraw'
						}.button`
					)
				)}
			</MarginActionButton>

			{error && <ErrorView message={error} formatter="revert" />}
		</StyledBaseModal>
	);
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-top: 12px;
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

export const MarginActionButton = styled(Button)`
	margin-top: 16px;
	height: 55px;
	font-size: 15px;
`;

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`;

export const GasFeeContainer = styled(FlexDivRowCentered)`
	margin-bottom: 20px;
	p {
		margin: 0;
	}
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

const InputContainer = styled(CustomInput)`
	margin-bottom: 40px;
`;

import { wei } from '@synthetixio/wei';
import { constants } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import Loader from 'components/Loader';
import SegmentedControl from 'components/SegmentedControl';
import Connector from 'containers/Connector';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useSUSDContract from 'hooks/useSUSDContract';
import { balancesState, crossMarginAccountOverviewState } from 'store/futures';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

type DepositMarginModalProps = {
	defaultTab: 'deposit' | 'withdraw';
	onDismiss(): void;
	onComplete?(): void;
};

const PLACEHOLDER = '$0.00';
const MIN_DEPOSIT_AMOUNT = wei('50');

export default function DepositWithdrawCrossMargin({
	defaultTab = 'deposit',
	onDismiss,
	onComplete,
}: DepositMarginModalProps) {
	const { t } = useTranslation();
	const { signer } = Connector.useContainer();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { refetchUntilUpdate } = useRefetchContext();
	const susdContract = useSUSDContract();

	const balances = useRecoilValue(balancesState);
	const { freeMargin, allowance } = useRecoilValue(crossMarginAccountOverviewState);

	const [amount, setAmount] = useState<string>('');
	const [transferType, setTransferType] = useState(0);
	const [txState, setTxState] = useState<'none' | 'approving' | 'submitting' | 'complete'>('none');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setTransferType(defaultTab === 'deposit' ? 0 : 1);
	}, [defaultTab]);

	const susdBal = transferType === 0 ? balances?.susdWalletBalance || zeroBN : freeMargin;

	const submitDeposit = useCallback(async () => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross-margin account');

			setTxState('submitting');
			const tx = await crossMarginAccountContract.deposit(wei(amount || 0).toBN());
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: async () => {
					await refetchUntilUpdate('account-margin-change');
					setTxState('complete');
					onComplete?.();
					onDismiss();
				},
			});
		} catch (err) {
			setError(err.message);
			setTxState('none');
			logError(err);
		}
	}, [crossMarginAccountContract, amount, refetchUntilUpdate, onComplete, onDismiss]);

	const depositMargin = useCallback(async () => {
		try {
			const wallet = await signer?.getAddress();

			if (!crossMarginAccountContract || !wallet) throw new Error('No cross margin account');
			const weiAmount = wei(amount ?? 0, 18);

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
	}, [
		crossMarginAccountContract,
		amount,
		signer,
		susdContract,
		allowance,
		monitorTransaction,
		submitDeposit,
	]);

	const withdrawMargin = useCallback(async () => {
		try {
			if (!crossMarginAccountContract) throw new Error('No cross-margin account');
			setTxState('submitting');
			const tx = await crossMarginAccountContract.withdraw(wei(amount).toBN());
			monitorTransaction({
				txHash: tx.hash,
				onTxConfirmed: async () => {
					await refetchUntilUpdate('account-margin-change');
					setTxState('complete');
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
		refetchUntilUpdate,
		onComplete,
		onDismiss,
	]);

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

	const isApproved = useMemo(() => {
		return allowance.gt(wei(amount || 0));
	}, [allowance, amount]);

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
					(transferType === 0
						? t(
								`futures.market.trade.margin.modal.deposit.${
									isApproved ? 'button' : 'approve-button'
								}`
						  )
						: t(`futures.market.trade.margin.modal.withdraw.button`))
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
	text-transform: initial;
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

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

const InputContainer = styled(CustomInput)`
	margin-bottom: 10px;
`;

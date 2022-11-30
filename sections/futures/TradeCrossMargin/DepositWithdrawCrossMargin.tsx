import { wei } from '@synthetixio/wei';
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
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { approveCrossMargin, depositCrossMargin, withdrawCrossMargin } from 'state/futures/actions';
import {
	selectCrossMarginBalanceInfo,
	selectFuturesTransaction,
	selectIsApprovingDeposit,
	selectIsSubmittingTransfer,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { balancesState } from 'store/futures';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

type DepositMarginModalProps = {
	defaultTab: 'deposit' | 'withdraw';
	onDismiss(): void;
};

const PLACEHOLDER = '$0.00';

export default function DepositWithdrawCrossMargin({
	defaultTab = 'deposit',
	onDismiss,
}: DepositMarginModalProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const balances = useRecoilValue(balancesState);
	const crossMarginBalanceInfo = useAppSelector(selectCrossMarginBalanceInfo);
	const transactionState = useAppSelector(selectFuturesTransaction);
	const isSubmitting = useAppSelector(selectIsSubmittingTransfer);
	const isApproving = useAppSelector(selectIsApprovingDeposit);

	const [amount, setAmount] = useState<string>('');
	const [transferType, setTransferType] = useState(0);

	useEffect(() => {
		setTransferType(defaultTab === 'deposit' ? 0 : 1);
	}, [defaultTab]);

	const susdBal =
		transferType === 0 ? balances?.susdWalletBalance || zeroBN : crossMarginBalanceInfo.freeMargin;

	const submitDeposit = useCallback(async () => {
		dispatch(depositCrossMargin(wei(amount)));
	}, [amount, dispatch]);

	const depositMargin = useCallback(async () => {
		try {
			const weiAmount = wei(amount ?? 0, 18);

			if (wei(crossMarginBalanceInfo.allowance).lt(weiAmount)) {
				dispatch(approveCrossMargin());
			} else {
				submitDeposit();
			}
		} catch (err) {
			logError(err);
		}
	}, [amount, crossMarginBalanceInfo.allowance, dispatch, submitDeposit]);

	const withdrawMargin = useCallback(async () => {
		dispatch(withdrawCrossMargin(wei(amount)));
	}, [amount, dispatch]);

	const disabledReason = useMemo(() => {
		const amtWei = wei(amount || 0);
		if (transferType === 0) {
			const total = wei(crossMarginBalanceInfo.freeMargin).add(amtWei);
			if (total.lt(MIN_MARGIN_AMOUNT))
				return t('futures.market.trade.margin.modal.deposit.min-deposit');
			if (amtWei.gt(susdBal)) return t('futures.market.trade.margin.modal.deposit.exceeds-balance');
		} else {
			if (amtWei.gt(crossMarginBalanceInfo.freeMargin))
				return t('futures.market.trade.margin.modal.deposit.exceeds-balance');
		}
	}, [amount, crossMarginBalanceInfo.freeMargin, transferType, susdBal, t]);

	const isApproved = useMemo(() => {
		return crossMarginBalanceInfo.allowance.gt(wei(amount || 0));
	}, [crossMarginBalanceInfo.allowance, amount]);

	const handleSetMax = React.useCallback(() => {
		setAmount(susdBal.toString());
	}, [susdBal]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		setAmount('');
	};

	const isLoading = isSubmitting || isApproving;

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
				disabled={!!disabledReason || !amount || isLoading}
				fullWidth
				onClick={transferType === 0 ? depositMargin : withdrawMargin}
			>
				{isLoading ? (
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

			{transactionState?.error && <ErrorView message={transactionState.error} formatter="revert" />}
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

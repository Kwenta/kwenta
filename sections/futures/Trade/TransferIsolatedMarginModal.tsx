import { wei } from '@synthetixio/wei';
import dynamic from 'next/dynamic';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import Error from 'components/Error';
import CustomInput from 'components/Input/CustomInput';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { MIN_MARGIN_AMOUNT } from 'constants/futures';
import { selectSusdBalance } from 'state/balances/selectors';
import { depositIsolatedMargin, withdrawIsolatedMargin } from 'state/futures/actions';
import {
	selectIsolatedTransferError,
	selectIsSubmittingIsolatedTransfer,
	selectPosition,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';

type Props = {
	onDismiss(): void;
	defaultTab: 'deposit' | 'withdraw';
};

const SocketBridge = dynamic(() => import('../../../components/SocketBridge'), {
	ssr: false,
});

const PLACEHOLDER = '$0.00';

const TransferIsolatedMarginModal: React.FC<Props> = ({ onDismiss, defaultTab }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const submitting = useAppSelector(selectIsSubmittingIsolatedTransfer);
	const txError = useAppSelector(selectIsolatedTransferError);
	const susdBalance = useAppSelector(selectSusdBalance);

	const minDeposit = useMemo(() => {
		const accessibleMargin = position?.accessibleMargin ?? zeroBN;
		const min = MIN_MARGIN_AMOUNT.sub(accessibleMargin);
		return min.lt(zeroBN) ? zeroBN : min;
	}, [position?.accessibleMargin]);

	const [amount, setAmount] = useState('');
	const [transferType, setTransferType] = useState(defaultTab === 'deposit' ? 0 : 1);

	const susdBal = transferType === 0 ? susdBalance : position?.accessibleMargin || zeroBN;
	const accessibleMargin = useMemo(() => position?.accessibleMargin ?? zeroBN, [
		position?.accessibleMargin,
	]);

	const isSufficientFund = useMemo(() => susdBalance.gte(minDeposit), [susdBalance, minDeposit]);
	const isDisabled = useMemo(() => {
		if (!amount || submitting) {
			return true;
		}
		const amtWei = wei(amount);
		if (amtWei.eq(0) || amtWei.gt(susdBal) || (transferType === 0 && amtWei.lt(minDeposit))) {
			return true;
		}
		return false;
	}, [amount, susdBal, minDeposit, transferType, submitting]);

	const computedWithdrawAmount = useMemo(
		() => (accessibleMargin.eq(wei(amount || 0)) ? accessibleMargin : wei(amount || 0)),
		[amount, accessibleMargin]
	);

	const handleSetMax = useCallback(() => {
		if (transferType === 0) {
			setAmount(susdBal.toString());
		} else {
			setAmount(accessibleMargin.toString());
		}
	}, [susdBal, accessibleMargin, transferType]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		setAmount('');
	};

	const onDeposit = () => {
		dispatch(depositIsolatedMargin(wei(amount)));
	};

	const onWithdraw = () => {
		dispatch(withdrawIsolatedMargin(computedWithdrawAmount));
	};

	return (
		<>
			<StyledBaseModal
				title={
					transferType === 0
						? t('futures.market.trade.margin.modal.deposit.title')
						: t('futures.market.trade.margin.modal.withdraw.title')
				}
				isOpen
				onDismiss={onDismiss}
			>
				<StyledSegmentedControl
					values={['Deposit', 'Withdraw']}
					selectedIndex={transferType}
					onChange={onChangeTab}
				/>
				<BalanceContainer>
					<BalanceText $gold>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
					<BalanceText>
						<span>{formatDollars(susdBal)}</span> sUSD
					</BalanceText>
				</BalanceContainer>
				<CustomInput
					dataTestId="futures-market-trade-deposit-margin-input"
					placeholder={PLACEHOLDER}
					value={amount}
					onChange={(_, v) => setAmount(v)}
					right={
						<MaxButton onClick={handleSetMax}>
							{t('futures.market.trade.margin.modal.max')}
						</MaxButton>
					}
				/>
				{transferType === 0 ? (
					<MinimumAmountDisclaimer>
						{t('futures.market.trade.margin.modal.deposit.disclaimer')}
					</MinimumAmountDisclaimer>
				) : (
					<Spacer height={20} />
				)}

				<MarginActionButton
					data-testid="futures-market-trade-deposit-margin-button"
					disabled={isDisabled}
					fullWidth
					onClick={transferType === 0 ? onDeposit : onWithdraw}
				>
					{transferType === 0
						? t('futures.market.trade.margin.modal.deposit.button')
						: t('futures.market.trade.margin.modal.withdraw.button')}
				</MarginActionButton>

				{txError && <Error message={txError} formatter="revert" />}
			</StyledBaseModal>
			{!isSufficientFund && <SocketBridge title={'Swap or Bridge'} onDismiss={onDismiss} />}
		</>
	);
};

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`;

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.selectedTheme.yellow : props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export const MarginActionButton = styled(Button)`
	height: 55px;
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

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`;

export const GasFeeContainer = styled(FlexDivRowCentered)`
	margin: 13px 0px;
	padding: 0 14px;
	p {
		margin: 0;
	}
`;

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

export default TransferIsolatedMarginModal;

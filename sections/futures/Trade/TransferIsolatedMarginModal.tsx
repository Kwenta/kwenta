import Wei, { wei } from '@synthetixio/wei';
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
import { transferIsolatedMargin } from 'state/futures/actions';
import { setIsolatedTransferAmount } from 'state/futures/reducer';
import { selectIsolatedTransferAmount, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FlexDivRowCentered } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';
type Props = {
	onDismiss(): void;
	defaultTab: 'deposit' | 'withdraw';
	sUSDBalance: Wei;
};

const PLACEHOLDER = '$0.00';

const TransferIsolatedMarginModal: React.FC<Props> = ({ onDismiss, sUSDBalance, defaultTab }) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const position = useAppSelector(selectPosition);
	const transferAmount = useAppSelector(selectIsolatedTransferAmount);

	const minDeposit = useMemo(() => {
		const accessibleMargin = position?.accessibleMargin ?? zeroBN;
		const min = MIN_MARGIN_AMOUNT.sub(accessibleMargin);
		return min.lt(zeroBN) ? zeroBN : min;
	}, [position?.accessibleMargin]);

	const [transferType, setTransferType] = useState(defaultTab === 'deposit' ? 0 : 1);

	const susdBal = transferType === 0 ? sUSDBalance : position?.accessibleMargin || zeroBN;
	const accessibleMargin = useMemo(() => position?.accessibleMargin ?? zeroBN, [
		position?.accessibleMargin,
	]);

	const isDisabled = useMemo(() => {
		if (!transferAmount) {
			return true;
		}
		const amtWei = wei(transferAmount);
		if (amtWei.eq(0) || amtWei.gt(susdBal) || (transferType === 0 && amtWei.lt(minDeposit))) {
			return true;
		}
		return false;
	}, [transferAmount, susdBal, minDeposit, transferType]);

	const handleSetMax = useCallback(() => {
		if (transferType === 0) {
			dispatch(setIsolatedTransferAmount(susdBal.toString()));
		} else {
			dispatch(setIsolatedTransferAmount(accessibleMargin.mul(wei(-1)).toString()));
		}
	}, [dispatch, susdBal, accessibleMargin, transferType]);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
		dispatch(setIsolatedTransferAmount(''));
	};

	const handleSubmit = useCallback(() => {
		dispatch(transferIsolatedMargin());
	}, [dispatch]);

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.deposit.title')}
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
				value={transferAmount}
				onChange={(_, v) => {
					dispatch(setIsolatedTransferAmount(transferType === 0 ? v : -v));
				}}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
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
				onClick={handleSubmit}
			>
				{transferType === 0
					? t('futures.market.trade.margin.modal.deposit.button')
					: t('futures.market.trade.margin.modal.withdraw.button')}
			</MarginActionButton>

			{/* <GasFeeContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.gas-fee')}:</BalanceText>
				<BalanceText>
					<span>
						{transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE}
					</span>
				</BalanceText>
			</GasFeeContainer> */}

			{/* {depositTxn.errorMessage && <Error message={depositTxn.errorMessage} formatter="revert" />} */}
		</StyledBaseModal>
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

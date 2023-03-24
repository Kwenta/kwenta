import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { FlexDivRowCentered } from 'components/layout/flex';
import SegmentedControl from 'components/SegmentedControl';
import { Body } from 'components/Text';
import { setOpenModal } from 'state/app/reducer';
import { selectTransaction } from 'state/app/selectors';
import { submitCrossMarginAdjustMargin } from 'state/futures/actions';
import {
	selectIsFetchingTradePreview,
	selectPosition,
	selectPreviewData,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatCryptoCurrency } from 'utils/formatters/number';

import EditPositionMarginInput from './EditPositionMarginInput';

export default function EditPositionMarginModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview);
	const position = useAppSelector(selectPosition);
	const preview = useAppSelector(selectPreviewData);

	const [transferType, setTransferType] = useState(0);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
	};

	const submitMarginChange = useCallback(() => {
		dispatch(submitCrossMarginAdjustMargin());
	}, [dispatch]);

	const isLoading = isSubmitting || isFetchingPreview;

	return (
		<StyledBaseModal
			title={transferType === 0 ? 'Increase Position Margin' : 'Withdraw Position Margin'}
			isOpen
			onDismiss={() => dispatch(setOpenModal(null))}
		>
			<SegmentedControl
				values={['Add Margin', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			<InfoContainer>
				<BalanceText>{t('futures.market.trade.edit-position.current-margin')}:</BalanceText>
				<BalanceText>
					<span>{formatCryptoCurrency(position?.remainingMargin ?? '0')}</span>
				</BalanceText>
			</InfoContainer>

			<EditPositionMarginInput type={transferType === 0 ? 'deposit' : 'withdraw'} />

			<InfoContainer>
				<BalanceText>{t('futures.market.trade.edit-position.new-leverage')}:</BalanceText>

				<BalanceText>
					<span>{preview?.leverage ? preview.leverage.toString(2) + 'x' : '-'}</span>
				</BalanceText>
			</InfoContainer>

			<Button
				loading={isLoading}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isLoading}
				fullWidth
				onClick={submitMarginChange}
			>
				{t(`futures.market.trade.edit-position.submit-margin`)}
			</Button>

			{transactionState?.error && <ErrorView message={transactionState.error} formatter="revert" />}
		</StyledBaseModal>
	);
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const InfoContainer = styled(FlexDivRowCentered)`
	margin: 16px 0;
`;

export const BalanceText = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
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

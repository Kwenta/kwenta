import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
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

import { BalanceText, InfoContainer } from './EditPositionMarginModal';
import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput';

const PERCENT_OPTIONS = ['10%', '25%', '50%', '100%'];

export default function EditStopLossAndTakeProfitModal() {
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

	const onSelectPercent = (index: number) => {
		const percent = PERCENT_OPTIONS[index].replace('%', '');
		// const margin = idleMargin.div(100).mul(percent);

		// dispatch(editCrossMarginMarginDelta(floorNumber(margin).toString()));
	};

	const isLoading = isSubmitting || isFetchingPreview;

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.edit-sl-tp.title`)}
			isOpen
			onDismiss={() => dispatch(setOpenModal(null))}
		>
			<EditStopLossAndTakeProfitInput type={'take-profit'} />

			<Spacer height={10} />

			<SelectorButtons
				onSelect={onSelectPercent}
				options={PERCENT_OPTIONS}
				type={'pill-button-large'}
			/>

			<InfoContainer>
				<BalanceText>{t('futures.market.trade.edit-sl-tp.estimated-pnl')}</BalanceText>

				<BalanceText>
					<span>{'-'}</span>
				</BalanceText>
			</InfoContainer>

			<StyledSpacer />

			<EditStopLossAndTakeProfitInput type={'stop-loss'} />

			<Spacer height={10} />

			<SelectorButtons
				onSelect={onSelectPercent}
				options={PERCENT_OPTIONS}
				type={'pill-button-large'}
			/>

			<InfoContainer>
				<BalanceText>{t('futures.market.trade.edit-sl-tp.estimated-pnl')}</BalanceText>

				<BalanceText>
					<span>{'-'}</span>
				</BalanceText>
			</InfoContainer>

			<StyledInfoContainer style={{ flexDirection: 'column' }}>
				<StyledBalanceText style={{ textAlign: 'center' }}>
					{t('futures.market.trade.edit-sl-tp.entire-position')}
				</StyledBalanceText>
				<StyledBalanceText style={{ textAlign: 'center' }}>
					{t('futures.market.trade.edit-sl-tp.any-existing-cancelled')}
				</StyledBalanceText>
			</StyledInfoContainer>

			<Button
				loading={isLoading}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isLoading}
				fullWidth
				onClick={submitMarginChange}
			>
				{t(`futures.market.trade.edit-sl-tp.set-sl-n-tp`)}
			</Button>

			{transactionState?.error && <ErrorView message={transactionState.error} formatter="revert" />}
		</StyledBaseModal>
	);
}

const StyledSpacer = styled(Spacer)`
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	width: 100%;
	margin: 10px 0px 20px;
`;

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 440px;
	}
`;

const StyledInfoContainer = styled(InfoContainer)`
	background: ${(props) => props.theme.colors.selectedTheme.button.red.fill};
	padding: 10px 0;
	border-radius: 8px;
`;

const StyledBalanceText = styled(BalanceText)`
	color: ${(props) => props.theme.colors.selectedTheme.button.red.text};
`;

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { setOpenModal } from 'state/app/reducer';
import { selectTransaction } from 'state/app/selectors';
import { submitCrossMarginAdjustMargin } from 'state/futures/actions';
import {
	selectIsFetchingTradePreview,
	selectMarketPrice,
	selectPosition,
	selectPreviewData,
	selectSlTpTradeInputs,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars } from 'utils/formatters/number';

import { BalanceText, InfoContainer } from './EditPositionMarginModal';
import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput';

const PERCENT_OPTIONS = ['25%', '50%', '75%', '100%'];

export default function EditStopLossAndTakeProfitModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs);
	const currentPrice = useAppSelector(selectMarketPrice);

	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview);

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
			<EditStopLossAndTakeProfitInput
				type={'take-profit'}
				value={currentPrice ? formatDollars(currentPrice, { suggestDecimals: true }) : NO_VALUE}
			/>

			<SelectorButtons
				onSelect={onSelectPercent}
				options={PERCENT_OPTIONS}
				type={'pill-button-large'}
			/>

			<Spacer height={20} />

			<InfoContainer style={{ margin: 0 }}>
				<BalanceText>{t('futures.market.trade.edit-sl-tp.estimated-pnl')}</BalanceText>

				<BalanceText>
					<span>{'-'}</span>
				</BalanceText>
			</InfoContainer>

			<StyledSpacer />

			<EditStopLossAndTakeProfitInput
				type={'stop-loss'}
				value={currentPrice ? formatDollars(currentPrice, { suggestDecimals: true }) : NO_VALUE}
			/>

			<SelectorButtons
				onSelect={onSelectPercent}
				options={PERCENT_OPTIONS}
				type={'pill-button-large'}
			/>

			<Spacer height={20} />

			<InfoContainer style={{ margin: 0 }}>
				<BalanceText>{t('futures.market.trade.edit-sl-tp.estimated-pnl')}</BalanceText>

				<BalanceText>
					<span>{'-'}</span>
				</BalanceText>
			</InfoContainer>

			<Spacer height={20} />

			<ErrorView message={t('futures.market.trade.edit-sl-tp.warning')} messageType="warn" />

			<Spacer height={4} />

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
	margin: 20px 0px 15px;
`;

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 438px;
	}
`;

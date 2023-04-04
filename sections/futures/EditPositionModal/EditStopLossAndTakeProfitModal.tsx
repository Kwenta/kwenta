import React, { ChangeEvent, useCallback, useMemo } from 'react';
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
import { updateStopLossAndTakeProfit } from 'state/futures/actions';
import { setCrossMarginTradeStopLoss, setCrossMarginTradeTakeProfit } from 'state/futures/reducer';
import {
	selectLeverageSide,
	selectMarketPrice,
	selectSlTpTradeInputs,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars, suggestedDecimals } from 'utils/formatters/number';

import { BalanceText, InfoContainer } from './EditPositionMarginModal';
import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput';

const TP_OPTIONS = ['none', '5%', '10%', '25%', '50%', '100%'];
const SL_OPTIONS = ['none', '2%', '5%', '10%', '20%', '50%'];

export default function EditStopLossAndTakeProfitModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const leverageSide = useAppSelector(selectLeverageSide);
	const currentPrice = useAppSelector(selectMarketPrice);
	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs);

	const onSelectStopLossPercent = useCallback(
		(index) => {
			const option = SL_OPTIONS[index];
			if (option === 'none') {
				dispatch(setCrossMarginTradeStopLoss(''));
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100;
				const stopLoss =
					leverageSide === 'short'
						? currentPrice.add(currentPrice.mul(percent))
						: currentPrice.sub(currentPrice.mul(percent));
				const dp = suggestedDecimals(stopLoss);
				dispatch(setCrossMarginTradeStopLoss(stopLoss.toString(dp)));
			}
		},
		[currentPrice, dispatch, leverageSide]
	);

	const onSelectTakeProfit = useCallback(
		(index) => {
			const option = TP_OPTIONS[index];
			if (option === 'none') {
				dispatch(setCrossMarginTradeTakeProfit(''));
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100;
				const takeProfit =
					leverageSide === 'short'
						? currentPrice.sub(currentPrice.mul(percent))
						: currentPrice.add(currentPrice.mul(percent));
				const dp = suggestedDecimals(takeProfit);
				dispatch(setCrossMarginTradeTakeProfit(takeProfit.toString(dp)));
			}
		},
		[currentPrice, dispatch, leverageSide]
	);

	const onChangeStopLoss = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossMarginTradeStopLoss(v));
		},
		[dispatch]
	);

	const onChangeTakeProfit = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossMarginTradeTakeProfit(v));
		},
		[dispatch]
	);

	const onSetStopLossAndTakeProfit = useCallback(() => dispatch(updateStopLossAndTakeProfit()), [
		dispatch,
	]);

	const isActive = useMemo(() => stopLossPrice || takeProfitPrice, [
		stopLossPrice,
		takeProfitPrice,
	]);

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.edit-sl-tp.title`)}
			isOpen
			onDismiss={() => dispatch(setOpenModal(null))}
		>
			<EditStopLossAndTakeProfitInput
				type={'take-profit'}
				invalid={false}
				currentPrice={
					currentPrice ? formatDollars(currentPrice, { suggestDecimals: true }) : NO_VALUE
				}
				value={takeProfitPrice}
				onChange={onChangeTakeProfit}
			/>

			<SelectorButtons
				onSelect={onSelectTakeProfit}
				options={TP_OPTIONS}
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
				invalid={false}
				currentPrice={
					currentPrice ? formatDollars(currentPrice, { suggestDecimals: true }) : NO_VALUE
				}
				value={stopLossPrice}
				onChange={onChangeStopLoss}
			/>

			<SelectorButtons
				onSelect={onSelectStopLossPercent}
				options={SL_OPTIONS}
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
				loading={isSubmitting}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={!isActive}
				fullWidth
				onClick={onSetStopLossAndTakeProfit}
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

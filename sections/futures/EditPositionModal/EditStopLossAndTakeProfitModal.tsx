import React, { ChangeEvent, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { InfoBoxRow } from 'components/InfoBox';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { setShowPositionModal } from 'state/app/reducer';
import { selectTransaction } from 'state/app/selectors';
import { calculateKeeperDeposit, updateStopLossAndTakeProfit } from 'state/futures/actions';
import { setCrossSLTPModalStopLoss, setCrossSLTPModalTakeProfit } from 'state/futures/reducer';
import {
	selectEditPositionModalInfo,
	selectLeverageSide,
	selectSlTpModalInputs,
	selectSmartMarginKeeperDeposit,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars, suggestedDecimals } from 'utils/formatters/number';

import { KeeperDepositRow } from '../FeeInfoBox/FeesRow.tsx';
import { BalanceText, InfoContainer } from './EditPositionMarginModal';
import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput';

const TP_OPTIONS = ['none', '5%', '10%', '25%', '50%', '100%'];
const SL_OPTIONS = ['none', '2%', '5%', '10%', '20%', '50%'];

export default function EditStopLossAndTakeProfitModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const leverageSide = useAppSelector(selectLeverageSide);
	const transactionState = useAppSelector(selectTransaction);
	const { market, marketPrice } = useAppSelector(selectEditPositionModalInfo);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpModalInputs);
	const keeperDeposit = useAppSelector(selectSmartMarginKeeperDeposit);

	useEffect(() => {
		dispatch(setCrossSLTPModalStopLoss(''));
		dispatch(setCrossSLTPModalTakeProfit(''));
		dispatch(calculateKeeperDeposit());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSelectStopLossPercent = useCallback(
		(index) => {
			const option = SL_OPTIONS[index];
			if (option === 'none') {
				dispatch(setCrossSLTPModalStopLoss('0'));
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100;
				const stopLoss =
					leverageSide === 'short'
						? marketPrice.add(marketPrice.mul(percent))
						: marketPrice.sub(marketPrice.mul(percent));
				const dp = suggestedDecimals(stopLoss);
				dispatch(setCrossSLTPModalStopLoss(stopLoss.toString(dp)));
			}
		},
		[marketPrice, dispatch, leverageSide]
	);

	const onSelectTakeProfit = useCallback(
		(index) => {
			const option = TP_OPTIONS[index];
			if (option === 'none') {
				dispatch(setCrossSLTPModalTakeProfit('0'));
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100;
				const takeProfit =
					leverageSide === 'short'
						? marketPrice.sub(marketPrice.mul(percent))
						: marketPrice.add(marketPrice.mul(percent));
				const dp = suggestedDecimals(takeProfit);
				dispatch(setCrossSLTPModalTakeProfit(takeProfit.toString(dp)));
			}
		},
		[marketPrice, dispatch, leverageSide]
	);

	const onChangeStopLoss = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossSLTPModalStopLoss(v));
		},
		[dispatch]
	);

	const onChangeTakeProfit = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setCrossSLTPModalTakeProfit(v));
		},
		[dispatch]
	);

	const onSetStopLossAndTakeProfit = useCallback(() => dispatch(updateStopLossAndTakeProfit()), [
		dispatch,
	]);

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.edit-sl-tp.title`)}
			isOpen
			onDismiss={() => dispatch(setShowPositionModal(null))}
		>
			<Spacer height={2} />
			<InfoBoxRow title={'Market'} value={market?.marketName} />
			<StyledSpacer marginTop={10} />
			<EditStopLossAndTakeProfitInput
				type={'take-profit'}
				invalid={false}
				currentPrice={
					marketPrice ? formatDollars(marketPrice, { suggestDecimals: true }) : NO_VALUE
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
					marketPrice ? formatDollars(marketPrice, { suggestDecimals: true }) : NO_VALUE
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
				disabled={false}
				fullWidth
				onClick={onSetStopLossAndTakeProfit}
			>
				{t(`futures.market.trade.edit-sl-tp.set-sl-n-tp`)}
			</Button>
			<Spacer height={20} />
			<KeeperDepositRow smartMarginKeeperDeposit={keeperDeposit} />

			{transactionState?.error && <ErrorView message={transactionState.error} formatter="revert" />}
		</StyledBaseModal>
	);
}

const StyledSpacer = styled(Spacer)<{ marginTop?: number }>`
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	width: 100%;
	margin: ${(props) => props.marginTop ?? 20}px 0px 15px;
`;

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 438px;
	}
`;

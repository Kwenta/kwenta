import { wei } from '@synthetixio/wei';
import React, { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { InfoBoxRow } from 'components/InfoBox';
import { FlexDivRowCentered } from 'components/layout/flex';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { ConditionalOrderTypeEnum, PositionSide } from 'sdk/types/futures';
import { setShowPositionModal } from 'state/app/reducer';
import { selectTransaction } from 'state/app/selectors';
import { calculateKeeperDeposit, updateStopLossAndTakeProfit } from 'state/futures/actions';
import { setCrossSLTPModalStopLoss, setCrossSLTPModalTakeProfit } from 'state/futures/reducer';
import {
	selectAllSLTPOrders,
	selectEditPositionModalInfo,
	selectSlTpModalInputs,
	selectSmartMarginKeeperDeposit,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars, stripZeros, suggestedDecimals } from 'utils/formatters/number';

import { KeeperDepositRow } from '../FeeInfoBox/FeesRow.tsx';
import PositionType from '../PositionType';
import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput';

const TP_OPTIONS = ['none', '5%', '10%', '25%', '50%', '100%'];
const SL_OPTIONS = ['none', '2%', '5%', '10%', '20%', '50%'];

export default function EditStopLossAndTakeProfitModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const transactionState = useAppSelector(selectTransaction);
	const { market, marketPrice, position } = useAppSelector(selectEditPositionModalInfo);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpModalInputs);
	const keeperDeposit = useAppSelector(selectSmartMarginKeeperDeposit);

	const sltpOrders = useAppSelector(selectAllSLTPOrders);
	const stopLoss = sltpOrders.find(
		(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.STOP
	);
	const takeProfit = sltpOrders.find(
		(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT
	);

	const hasInputValues = useMemo(() => takeProfitPrice || stopLossPrice, [
		takeProfitPrice,
		stopLossPrice,
	]);
	const hasOrders = useMemo(() => stopLoss || takeProfit, [stopLoss, takeProfit]);

	const leverageWei = useMemo(() => {
		return position?.position?.leverage.gt(0) ? wei(position.position.leverage) : wei(1);
	}, [position?.position?.leverage]);

	const hasChangeOrders = useMemo(() => {
		const tpOrderPrice = takeProfit?.targetPrice
			? stripZeros(takeProfit?.targetPrice?.toString())
			: '';
		const slOrderPrice = stopLoss?.targetPrice ? stripZeros(stopLoss?.targetPrice?.toString()) : '';
		return hasOrders && (tpOrderPrice !== takeProfitPrice || slOrderPrice !== stopLossPrice);
	}, [hasOrders, stopLoss?.targetPrice, stopLossPrice, takeProfit?.targetPrice, takeProfitPrice]);

	const isActive = useMemo(
		() =>
			hasOrders
				? hasInputValues
					? hasChangeOrders
					: takeProfitPrice !== undefined || stopLossPrice !== undefined
				: hasInputValues,
		[hasChangeOrders, hasInputValues, hasOrders, stopLossPrice, takeProfitPrice]
	);

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
				const relativePercent = wei(percent).div(leverageWei);
				const stopLoss =
					position?.position?.side === 'short'
						? marketPrice.add(marketPrice.mul(relativePercent))
						: marketPrice.sub(marketPrice.mul(relativePercent));
				const dp = suggestedDecimals(stopLoss);
				dispatch(setCrossSLTPModalStopLoss(stopLoss.toString(dp)));
			}
		},
		[marketPrice, dispatch, position?.position?.side, leverageWei]
	);

	const onSelectTakeProfit = useCallback(
		(index) => {
			const option = TP_OPTIONS[index];
			if (option === 'none') {
				dispatch(setCrossSLTPModalTakeProfit('0'));
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100;
				const relativePercent = wei(percent).div(leverageWei);
				const takeProfit =
					position?.position?.side === 'short'
						? marketPrice.sub(marketPrice.mul(relativePercent))
						: marketPrice.add(marketPrice.mul(relativePercent));
				const dp = suggestedDecimals(takeProfit);
				dispatch(setCrossSLTPModalTakeProfit(takeProfit.toString(dp)));
			}
		},
		[marketPrice, dispatch, position?.position?.side, leverageWei]
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
			<InfoBoxRow
				title={'Market'}
				value={
					<FlexDivRowCentered>
						{market?.marketName}
						<Spacer width={8} />{' '}
						<PositionType side={position?.position?.side || PositionSide.LONG} />
					</FlexDivRowCentered>
				}
			/>
			<StyledSpacer marginTop={6} />
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

			<StyledSpacer height={10} />

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

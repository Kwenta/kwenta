import { ConditionalOrderTypeEnum, PositionSide } from '@kwenta/sdk/types'
import { stripZeros, suggestedDecimals } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AcceptWarningView from 'components/AcceptWarningView'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { InfoBoxRow } from 'components/InfoBox'
import { FlexDivRowCentered } from 'components/layout/flex'
import SelectorButtons from 'components/SelectorButtons'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { setShowPositionModal } from 'state/app/reducer'
import { selectAckedOrdersWarning, selectTransaction } from 'state/app/selectors'
import { clearTradeInputs } from 'state/futures/actions'
import { selectModalSLTPValidity, selectSubmittingFuturesTx } from 'state/futures/selectors'
import {
	calculateKeeperDeposit,
	updateStopLossAndTakeProfit,
} from 'state/futures/smartMargin/actions'
import { setSLTPModalStopLoss, setSLTPModalTakeProfit } from 'state/futures/smartMargin/reducer'
import {
	selectAllSLTPOrders,
	selectEditPositionModalInfo,
	selectKeeperDepositExceedsBal,
	selectSlTpModalInputs,
	selectSmartMarginKeeperDeposit,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { KeeperDepositRow } from '../FeeInfoBox/FeeRows'
import PositionType from '../PositionType'
import OrderAcknowledgement from '../Trade/OrderAcknowledgement'

import EditStopLossAndTakeProfitInput from './EditStopLossAndTakeProfitInput'

const TP_OPTIONS = ['none', '5%', '10%', '25%', '50%', '100%']
const SL_OPTIONS = ['none', '2%', '5%', '10%', '20%', '50%']

export default function EditStopLossAndTakeProfitModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const transactionState = useAppSelector(selectTransaction)
	const { market, position } = useAppSelector(selectEditPositionModalInfo)
	const exsistingSLTPOrders = useAppSelector(selectAllSLTPOrders)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpModalInputs)
	const keeperDeposit = useAppSelector(selectSmartMarginKeeperDeposit)
	const ethBalanceExceeded = useAppSelector(selectKeeperDepositExceedsBal)
	const hideOrderWarning = useAppSelector(selectAckedOrdersWarning)
	const sltpValidity = useAppSelector(selectModalSLTPValidity)

	const [acceptedSLRisk, setAcceptedSLRisk] = useState(false)

	const stopLoss = exsistingSLTPOrders.find(
		(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.STOP
	)
	const takeProfit = exsistingSLTPOrders.find(
		(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT
	)

	const [showOrderWarning, setShowOrderWarning] = useState(
		!stopLoss && !takeProfit && !hideOrderWarning
	)

	const hasInputValues = useMemo(
		() => takeProfitPrice || stopLossPrice,
		[takeProfitPrice, stopLossPrice]
	)
	const hasOrders = useMemo(() => stopLoss || takeProfit, [stopLoss, takeProfit])

	const leverageWei = useMemo(() => {
		return position?.activePosition.leverage?.gt(0) ? wei(position.activePosition.leverage) : wei(1)
	}, [position?.activePosition.leverage])

	const hasChangeOrders = useMemo(() => {
		const tpOrderPrice = takeProfit?.targetPrice
			? stripZeros(takeProfit?.targetPrice?.toString())
			: ''
		const slOrderPrice = stopLoss?.targetPrice ? stripZeros(stopLoss?.targetPrice?.toString()) : ''
		return hasOrders && (tpOrderPrice !== takeProfitPrice || slOrderPrice !== stopLossPrice)
	}, [hasOrders, stopLoss?.targetPrice, stopLossPrice, takeProfit?.targetPrice, takeProfitPrice])

	const ethBalWarningMessage = ethBalanceExceeded
		? t('futures.market.trade.confirmation.modal.eth-bal-warning')
		: null

	const isActive = useMemo(
		() =>
			!(sltpValidity.stopLoss.showWarning && !acceptedSLRisk) &&
			!sltpValidity.stopLoss.invalidLabel &&
			!sltpValidity.takeProfit.invalidLabel &&
			!ethBalanceExceeded &&
			(hasOrders
				? hasInputValues
					? hasChangeOrders
					: takeProfitPrice !== undefined || stopLossPrice !== undefined
				: hasInputValues),
		[
			ethBalanceExceeded,
			acceptedSLRisk,
			hasChangeOrders,
			hasInputValues,
			hasOrders,
			stopLossPrice,
			takeProfitPrice,
			sltpValidity.stopLoss.showWarning,
			sltpValidity.stopLoss.invalidLabel,
			sltpValidity.takeProfit.invalidLabel,
		]
	)

	const entryPriceWei = useMemo(() => {
		return position?.activePosition?.details?.entryPrice ?? wei(0)
	}, [position?.activePosition?.details?.entryPrice])

	const calculateSizeWei = useMemo(() => {
		if (!position?.activePosition.size) {
			return wei(0)
		}

		return position.activePosition.size.mul(entryPriceWei)
	}, [position?.activePosition.size, entryPriceWei])

	useEffect(() => {
		const existingSL = exsistingSLTPOrders.find(
			(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.STOP
		)
		const existingTP = exsistingSLTPOrders.find(
			(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT
		)
		dispatch(clearTradeInputs())

		dispatch(
			setSLTPModalStopLoss(
				existingSL?.targetPrice ? stripZeros(existingSL.targetPrice.toString()) : ''
			)
		)
		dispatch(
			setSLTPModalTakeProfit(
				existingTP?.targetPrice ? stripZeros(existingTP.targetPrice.toString()) : ''
			)
		)
		dispatch(calculateKeeperDeposit())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onSelectStopLossPercent = useCallback(
		(index: number) => {
			const option = SL_OPTIONS[index]
			if (option === 'none') {
				dispatch(setSLTPModalStopLoss(''))
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100
				const relativePercent = wei(percent).div(leverageWei)
				const stopLoss =
					position?.activePosition.side === 'short'
						? entryPriceWei.add(entryPriceWei.mul(relativePercent))
						: entryPriceWei.sub(entryPriceWei.mul(relativePercent))
				const dp = suggestedDecimals(stopLoss)
				dispatch(setSLTPModalStopLoss(stopLoss.toString(dp)))
			}
		},
		[entryPriceWei, dispatch, position?.activePosition.side, leverageWei]
	)

	const onSelectTakeProfit = useCallback(
		(index: number) => {
			const option = TP_OPTIONS[index]
			if (option === 'none') {
				dispatch(setSLTPModalTakeProfit(''))
			} else {
				const percent = Math.abs(Number(option.replace('%', ''))) / 100
				const relativePercent = wei(percent).div(leverageWei)
				const takeProfit =
					position?.activePosition.side === 'short'
						? entryPriceWei.sub(entryPriceWei.mul(relativePercent))
						: entryPriceWei.add(entryPriceWei.mul(relativePercent))
				const dp = suggestedDecimals(takeProfit)
				dispatch(setSLTPModalTakeProfit(takeProfit.toString(dp)))
			}
		},
		[entryPriceWei, dispatch, position?.activePosition.side, leverageWei]
	)

	const onChangeStopLoss = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setSLTPModalStopLoss(v))
		},
		[dispatch]
	)

	const onChangeTakeProfit = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setSLTPModalTakeProfit(v))
		},
		[dispatch]
	)

	const onSetStopLossAndTakeProfit = useCallback(
		() => dispatch(updateStopLossAndTakeProfit()),
		[dispatch]
	)

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.edit-sl-tp.title`)}
			isOpen
			onDismiss={() => dispatch(setShowPositionModal(null))}
		>
			<Spacer height={2} />
			<InfoBoxRow
				title={'Market'}
				nodeValue={
					<FlexDivRowCentered>
						<Body>{market?.marketName}</Body>
						<Spacer width={8} />{' '}
						<PositionType side={position?.activePosition.side || PositionSide.LONG} />
					</FlexDivRowCentered>
				}
			/>
			<StyledSpacer marginTop={6} />

			{showOrderWarning ? (
				<OrderAcknowledgement inContainer onClick={() => setShowOrderWarning(false)} />
			) : (
				<>
					<EditStopLossAndTakeProfitInput
						type={'take-profit'}
						invalidLabel={sltpValidity.takeProfit.invalidLabel}
						price={entryPriceWei}
						value={takeProfitPrice}
						positionSide={position?.activePosition.side || PositionSide.LONG}
						leverage={position?.activePosition.leverage || wei(1)}
						size={calculateSizeWei}
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
						positionSide={position?.activePosition.side || PositionSide.LONG}
						leverage={position?.activePosition.leverage || wei(1)}
						invalidLabel={sltpValidity.stopLoss.invalidLabel}
						price={entryPriceWei}
						value={stopLossPrice}
						size={calculateSizeWei}
						onChange={onChangeStopLoss}
					/>

					<SelectorButtons
						onSelect={onSelectStopLossPercent}
						options={SL_OPTIONS}
						type={'pill-button-large'}
					/>

					<Spacer height={20} />

					<ErrorView
						message={ethBalWarningMessage ?? t('futures.market.trade.edit-sl-tp.warning')}
						messageType="warn"
					/>

					<Spacer height={4} />
					{sltpValidity.stopLoss.showWarning && (
						<AcceptWarningView
							id="sl-risk-warning"
							style={{ margin: '0 0 20px 0' }}
							message={t('futures.market.trade.confirmation.modal.stop-loss-warning')}
							checked={acceptedSLRisk}
							onChangeChecked={(checked) => setAcceptedSLRisk(checked)}
						/>
					)}

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

					{transactionState?.error && (
						<ErrorView message={transactionState.error} formatter="revert" />
					)}
				</>
			)}
		</StyledBaseModal>
	)
}

const StyledSpacer = styled(Spacer)<{ marginTop?: number }>`
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	width: 100%;
	margin: ${(props) => props.marginTop ?? 20}px 0px 15px;
`

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 438px;
	}
`

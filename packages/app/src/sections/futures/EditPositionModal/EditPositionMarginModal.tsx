import { ZERO_WEI } from '@kwenta/sdk/constants'
import { MIN_MARGIN_AMOUNT } from '@kwenta/sdk/constants'
import { formatDollars } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import { FlexDivRowCentered } from 'components/layout/flex'
import PreviewArrow from 'components/PreviewArrow'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { previewErrorI18n } from 'queries/futures/constants'
import { setShowPositionModal } from 'state/app/reducer'
import { selectShowPositionModal, selectTransaction } from 'state/app/selectors'
import {
	approveCrossMargin,
	clearTradeInputs,
	editCrossMarginPositionMargin,
	submitCrossMarginAdjustMargin,
} from 'state/futures/actions'
import {
	selectEditMarginAllowanceValid,
	selectEditPositionInputs,
	selectEditPositionModalInfo,
	selectEditPositionPreview,
	selectIdleMargin,
	selectIsFetchingTradePreview,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import EditPositionMarginInput from './EditPositionMarginInput'

export default function EditPositionMarginModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const transactionState = useAppSelector(selectTransaction)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview)
	const preview = useAppSelector(selectEditPositionPreview)
	const { marginDelta } = useAppSelector(selectEditPositionInputs)
	const idleMargin = useAppSelector(selectIdleMargin)
	const modal = useAppSelector(selectShowPositionModal)
	const { market, position } = useAppSelector(selectEditPositionModalInfo)
	const allowanceValid = useAppSelector(selectEditMarginAllowanceValid)

	const [transferType, setTransferType] = useState(0)

	useEffect(() => {
		dispatch(clearTradeInputs())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const isLoading = useMemo(
		() => isSubmitting || isFetchingPreview,
		[isSubmitting, isFetchingPreview]
	)

	const maxWithdraw = useMemo(() => {
		const maxSize = position?.remainingMargin.mul(market?.appMaxLeverage ?? 1)
		const currentSize = position?.position?.notionalValue
		const max = maxSize?.sub(currentSize).div(market?.appMaxLeverage ?? 1) ?? wei(0)
		const resultingMarginMax = position?.remainingMargin.sub(max) ?? wei(0)
		const remainingMarginMax = position?.remainingMargin.sub(MIN_MARGIN_AMOUNT) ?? wei(0)

		return max.lt(0) || remainingMarginMax.lt(0)
			? ZERO_WEI
			: resultingMarginMax.gte(MIN_MARGIN_AMOUNT)
			? max
			: remainingMarginMax
	}, [position?.remainingMargin, position?.position?.notionalValue, market?.appMaxLeverage])

	const maxUsdInputAmount = useMemo(
		() => (transferType === 0 ? idleMargin : maxWithdraw),
		[idleMargin, maxWithdraw, transferType]
	)

	const marginWei = useMemo(
		() => (!marginDelta || isNaN(Number(marginDelta)) ? wei(0) : wei(marginDelta)),
		[marginDelta]
	)

	const invalid = useMemo(() => marginWei.gt(maxUsdInputAmount), [marginWei, maxUsdInputAmount])

	const maxLeverageExceeded = useMemo(
		() => transferType === 1 && position?.position?.leverage.gt(market?.appMaxLeverage ?? 1),
		[transferType, position?.position?.leverage, market?.appMaxLeverage]
	)

	const previewError = useMemo(() => {
		if (maxLeverageExceeded) return 'Max leverage exceeded'
		if (preview?.showStatus) return preview?.statusMessage
		return null
	}, [preview?.showStatus, preview?.statusMessage, maxLeverageExceeded])

	const errorMessage = useMemo(
		() => previewError || transactionState?.error,
		[previewError, transactionState?.error]
	)

	const submitDisabled = useMemo(() => {
		return marginWei.eq(0) || invalid || isLoading || !!previewError
	}, [marginWei, invalid, isLoading, previewError])

	const onChangeTab = (selection: number) => {
		setTransferType(selection)
	}

	const submitMarginChange = useCallback(() => {
		dispatch(submitCrossMarginAdjustMargin())
	}, [dispatch])

	const onClose = () => {
		if (modal?.marketKey) {
			dispatch(editCrossMarginPositionMargin(modal.marketKey, ''))
		}
		dispatch(setShowPositionModal(null))
	}

	const handleApproveSmartMargin = useCallback(async () => {
		dispatch(approveCrossMargin())
	}, [dispatch])

	const depositButtonText = allowanceValid
		? t('futures.market.trade.edit-position.submit-margin-deposit')
		: t(`futures.market.trade.confirmation.modal.approve-order`)

	return (
		<StyledBaseModal
			title={transferType === 0 ? `Increase Position Margin` : `Reduce Position Margin`}
			isOpen
			onDismiss={onClose}
		>
			<Spacer height={10} />

			<SegmentedControl
				values={['Add Margin', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			<Spacer height={20} />

			<EditPositionMarginInput
				maxUsdInput={maxUsdInputAmount}
				type={transferType === 0 ? 'deposit' : 'withdraw'}
			/>

			<Spacer height={20} />
			<InfoBoxContainer>
				<InfoBoxRow
					boldValue
					title={t('futures.market.trade.edit-position.market')}
					value={market?.marketName}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>{preview.leverage.toString(2)}x</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.leverage-change')}
					value={position?.position?.leverage.toString(2) + 'x'}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{position?.remainingMargin
									? formatDollars(position?.remainingMargin.add(marginWei))
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.margin-change')}
					value={formatDollars(position?.remainingMargin || 0)}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{preview ? formatDollars(preview.liqPrice) : '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.liquidation')}
					value={formatDollars(position?.position?.liquidationPrice || 0)}
				/>
			</InfoBoxContainer>
			<Spacer height={20} />

			<Button
				loading={isLoading}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={submitDisabled}
				fullWidth
				onClick={allowanceValid ? submitMarginChange : handleApproveSmartMargin}
			>
				{transferType === 0
					? depositButtonText
					: t('futures.market.trade.edit-position.submit-margin-withdraw')}
			</Button>

			{errorMessage && (
				<>
					<Spacer height={20} />
					<ErrorView message={errorMessage} formatter="revert" />
				</>
			)}
		</StyledBaseModal>
	)
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`

export const InfoContainer = styled(FlexDivRowCentered)`
	margin: 16px 0;
`

export const BalanceText = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

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
`

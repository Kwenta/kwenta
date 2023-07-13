import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AcceptWarningView from 'components/AcceptWarningView'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import { FlexDivRowCentered } from 'components/layout/flex'
import PreviewArrow from 'components/PreviewArrow'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { setShowPositionModal } from 'state/app/reducer'
import { selectTransaction } from 'state/app/selectors'
import {
	clearTradeInputs,
	editCrossMarginPositionSize,
	submitCrossMarginAdjustPositionSize,
} from 'state/futures/actions'
import {
	selectEditPositionInputs,
	selectEditPositionModalInfo,
	selectEditPositionPreview,
	selectIsFetchingTradePreview,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import EditPositionFeeInfo from '../FeeInfoBox/EditPositionFeeInfo'

import EditPositionSizeInput from './EditPositionSizeInput'

export default function EditPositionSizeModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const transactionState = useAppSelector(selectTransaction)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview)
	const preview = useAppSelector(selectEditPositionPreview)
	const { nativeSizeDelta } = useAppSelector(selectEditPositionInputs)
	const { market, position, marketPrice } = useAppSelector(selectEditPositionModalInfo)

	const [overridePriceProtection, setOverridePriceProtection] = useState(false)
	const [editType, setEditType] = useState(0)

	useEffect(() => {
		dispatch(clearTradeInputs())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onChangeTab = (selection: number) => {
		if (market) {
			dispatch(editCrossMarginPositionSize(market.marketKey, ''))
		}
		setEditType(selection)
	}

	const submitMarginChange = useCallback(() => {
		dispatch(submitCrossMarginAdjustPositionSize(overridePriceProtection))
	}, [dispatch, overridePriceProtection])

	const isLoading = useMemo(
		() => isSubmitting || isFetchingPreview,
		[isSubmitting, isFetchingPreview]
	)

	const maxLeverage = useMemo(
		() => (editType === 0 ? market?.appMaxLeverage : market?.contractMaxLeverage) ?? wei(1),
		[market?.appMaxLeverage, editType, market?.contractMaxLeverage]
	)

	const resultingLeverage = useMemo(() => {
		if (!preview || !position) return
		return position.remainingMargin.gt(0)
			? preview.size.mul(marketPrice).div(position.remainingMargin).abs()
			: wei(0)
	}, [preview, position, marketPrice])

	const maxNativeIncreaseValue = useMemo(() => {
		if (!marketPrice || marketPrice.eq(0)) return ZERO_WEI
		const totalMax = position?.remainingMargin.mul(maxLeverage) ?? ZERO_WEI
		let max = totalMax.sub(position?.position?.notionalValue ?? 0)
		max = max.gt(0) ? max : ZERO_WEI
		return max.div(marketPrice)
	}, [marketPrice, position?.remainingMargin, position?.position?.notionalValue, maxLeverage])

	const maxNativeValue = useMemo(() => {
		return editType === 0 ? maxNativeIncreaseValue : position?.position?.size ?? ZERO_WEI
	}, [editType, maxNativeIncreaseValue, position?.position?.size])

	const minNativeValue = useMemo(() => {
		if (editType === 0) return ZERO_WEI
		// If a user is over max leverage they can only
		// decrease to a value below max leverage
		if (position?.position && position?.position?.leverage.gt(maxLeverage)) {
			const safeSize = position.remainingMargin.mul(maxLeverage).div(marketPrice)
			return position.position.size.sub(safeSize)
		}
		return ZERO_WEI
	}, [maxLeverage, position?.position, editType, marketPrice, position?.remainingMargin])

	const maxNativeValueWithBuffer = useMemo(() => {
		if (editType === 1) return maxNativeValue
		return maxNativeValue.add(maxNativeValue.mul(0.001))
	}, [maxNativeValue, editType])

	const sizeWei = useMemo(
		() => (!nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? wei(0) : wei(nativeSizeDelta)),
		[nativeSizeDelta]
	)

	const maxLeverageExceeded = useMemo(() => {
		return (
			(editType === 0 && position?.position?.leverage.gt(maxLeverage)) ||
			(editType === 1 && resultingLeverage?.gt(maxLeverage))
		)
	}, [editType, position?.position?.leverage, maxLeverage, resultingLeverage])

	const invalid = useMemo(
		() => sizeWei.abs().gt(maxNativeValueWithBuffer),
		[sizeWei, maxNativeValueWithBuffer]
	)

	const previewError = useMemo(() => {
		if (preview?.exceedsPriceProtection && !overridePriceProtection)
			return 'Exceeds Price Protection'
		if (maxLeverageExceeded) return 'Max leverage exceeded'
		if (preview?.statusMessage && preview.statusMessage !== 'Success') return preview?.statusMessage
		return null
	}, [
		preview?.statusMessage,
		preview?.exceedsPriceProtection,
		maxLeverageExceeded,
		overridePriceProtection,
	])

	const errorMessage = useMemo(
		() => previewError || transactionState?.error,
		[previewError, transactionState?.error]
	)

	const submitDisabled = useMemo(() => {
		return sizeWei.eq(0) || invalid || isLoading || !!previewError
	}, [sizeWei, invalid, isLoading, previewError])

	const onClose = () => {
		if (market) {
			dispatch(editCrossMarginPositionSize(market.marketKey, ''))
		}
		dispatch(setShowPositionModal(null))
	}

	return (
		<StyledBaseModal
			title={editType === 0 ? `Increase Position Size` : `Decrease Position Size`}
			isOpen
			onDismiss={onClose}
		>
			<Spacer height={10} />

			<SegmentedControl
				values={['Increase', 'Decrease']}
				selectedIndex={editType}
				onChange={onChangeTab}
			/>
			<Spacer height={20} />

			<EditPositionSizeInput
				minNativeValue={minNativeValue.lt(maxNativeValue) ? minNativeValue : ZERO_WEI}
				maxNativeValue={maxNativeValue}
				type={editType === 0 ? 'increase' : 'decrease'}
			/>

			<Spacer height={6} />
			<InfoBoxContainer>
				<InfoBoxRow
					boldValue
					title={t('futures.market.trade.edit-position.market')}
					textValue={market?.marketName}
				/>
				<InfoBoxRow
					textValueIcon={
						resultingLeverage && (
							<PreviewArrow showPreview>{resultingLeverage.toString(2)}x</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.leverage-change')}
					textValue={position?.position ? position?.position?.leverage.toString(2) + 'x' : '-'}
				/>
				<InfoBoxRow
					textValueIcon={
						preview?.size && (
							<PreviewArrow showPreview>
								{position?.remainingMargin
									? formatNumber(preview.size.abs(), { suggestDecimals: true })
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.position-size')}
					textValue={formatNumber(position?.position?.size || 0, { suggestDecimals: true })}
				/>
				<InfoBoxRow
					textValueIcon={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{preview ? formatDollars(preview.liqPrice, { suggestDecimals: true }) : '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.liquidation')}
					textValue={formatDollars(position?.position?.liquidationPrice || 0, {
						suggestDecimals: true,
					})}
				/>
				<InfoBoxRow
					color={preview?.exceedsPriceProtection ? 'negative' : 'primary'}
					title={t('futures.market.trade.edit-position.price-impact')}
					textValue={formatPercent(preview?.priceImpact || 0)}
				/>
				<InfoBoxRow
					title={t('futures.market.trade.edit-position.fill-price')}
					textValue={formatDollars(preview?.price || 0, { suggestDecimals: true })}
				/>
			</InfoBoxContainer>
			{preview?.exceedsPriceProtection && (
				<>
					<Spacer height={20} />
					<AcceptWarningView
						message="This trade incurs high slippage, proceed anyway?"
						checked={overridePriceProtection}
						onChangeChecked={(checked) => setOverridePriceProtection(checked)}
					/>
				</>
			)}
			<Spacer height={20} />

			<Button
				loading={isLoading}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={submitDisabled}
				fullWidth
				onClick={submitMarginChange}
			>
				{editType === 0
					? t('futures.market.trade.edit-position.submit-size-increase')
					: t('futures.market.trade.edit-position.submit-size-decrease')}
			</Button>

			{errorMessage && (
				<>
					<Spacer height={20} />
					<ErrorView message={transactionState?.error || errorMessage} formatter="revert" />
				</>
			)}
			<Spacer height={20} />
			<EditPositionFeeInfo />
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

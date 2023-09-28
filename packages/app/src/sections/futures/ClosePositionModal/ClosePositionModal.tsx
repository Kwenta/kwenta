import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarginType, PositionSide, PotentialTradeStatus } from '@kwenta/sdk/types'
import {
	floorNumber,
	formatDollars,
	formatNumber,
	formatPercent,
	stripZeros,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import { FlexDivRowCentered } from 'components/layout/flex'
import PreviewArrow from 'components/PreviewArrow'
import SelectorButtons from 'components/SelectorButtons'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { previewErrorI18n } from 'queries/futures/constants'
import { setShowPositionModal } from 'state/app/reducer'
import { selectTransaction } from 'state/app/selectors'
import { selectFuturesType } from 'state/futures/common/selectors'
import { submitCrossMarginReducePositionOrder } from 'state/futures/crossMargin/actions'
import { selectSubmittingFuturesTx } from 'state/futures/selectors'
import {
	editClosePositionPrice,
	editClosePositionSizeDelta,
	submitSmartMarginReducePositionOrder,
} from 'state/futures/smartMargin/actions'
import { setClosePositionOrderType } from 'state/futures/smartMargin/reducer'
import {
	selectCloseSMPositionOrderInputs,
	selectClosePositionPreview,
	selectEditPositionModalInfo,
	selectIsFetchingTradePreview,
	selectKeeperDepositExceedsBal,
	selectTradePreviewError,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import AcceptWarningView from '../../../components/AcceptWarningView'
import ClosePositionFeeInfo from '../FeeInfoBox/ClosePositionFeeInfo'
import OrderTypeSelector from '../Trade/OrderTypeSelector'

import ClosePositionPriceInput from './ClosePositionPriceInput'
import ClosePositionSizeInput from './ClosePositionSizeInput'

const CLOSE_PERCENT_OPTIONS = ['25%', '50%', '75%', '100%']

export default function ClosePositionModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const transactionState = useAppSelector(selectTransaction)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview)
	const previewTrade = useAppSelector(selectClosePositionPreview)
	const previewError = useAppSelector(selectTradePreviewError)
	const accountType = useAppSelector(selectFuturesType)
	const ethBalanceExceeded = useAppSelector(selectKeeperDepositExceedsBal)
	const { nativeSizeDelta, orderType, price } = useAppSelector(selectCloseSMPositionOrderInputs)
	const { market, position } = useAppSelector(selectEditPositionModalInfo)

	const [overridePriceProtection, setOverridePriceProtection] = useState(false)

	const submitCloseOrder = useCallback(() => {
		if (accountType === FuturesMarginType.SMART_MARGIN) {
			dispatch(submitSmartMarginReducePositionOrder(overridePriceProtection))
		} else {
			dispatch(submitCrossMarginReducePositionOrder())
		}
	}, [dispatch, accountType, overridePriceProtection])

	const isLoading = useMemo(
		() => isSubmitting || isFetchingPreview,
		[isSubmitting, isFetchingPreview]
	)

	const maxNativeValue = useMemo(() => {
		return position?.activePosition?.size ?? ZERO_WEI
	}, [position?.activePosition?.size])

	const sizeWei = useMemo(
		() => (!nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? wei(0) : wei(nativeSizeDelta)),
		[nativeSizeDelta]
	)

	const invalidSize = useMemo(() => {
		return sizeWei.abs().gt(maxNativeValue.abs())
	}, [sizeWei, maxNativeValue])

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError))
		if (previewTrade?.showStatus) return previewTrade?.statusMessage
		return null
	}, [previewTrade?.showStatus, previewTrade?.statusMessage, previewError, t])

	const showEthBalWarning = useMemo(() => {
		return ethBalanceExceeded && orderType !== 'market'
	}, [ethBalanceExceeded, orderType])

	const ethBalWarningMessage = showEthBalWarning
		? t('futures.market.trade.confirmation.modal.eth-bal-warning')
		: null

	const submitDisabled = useMemo(() => {
		if (
			(orderType === 'limit' || orderType === 'stop_market') &&
			(!price?.value || Number(price.value) === 0 || showEthBalWarning)
		) {
			return true
		}

		if (previewTrade?.exceedsPriceProtection && !overridePriceProtection) return true
		return (
			sizeWei.eq(0) ||
			invalidSize ||
			price?.invalidLabel ||
			isLoading ||
			orderError ||
			previewTrade?.status !== PotentialTradeStatus.OK
		)
	}, [
		showEthBalWarning,
		sizeWei,
		invalidSize,
		isLoading,
		orderError,
		price?.invalidLabel,
		price?.value,
		orderType,
		previewTrade?.status,
		overridePriceProtection,
		previewTrade?.exceedsPriceProtection,
	])

	const onClose = () => {
		if (market) {
			dispatch(editClosePositionSizeDelta(market.marketKey, ''))
			dispatch(editClosePositionPrice(market.marketKey, ''))
		}
		dispatch(setShowPositionModal(null))
	}

	const onSelectPercent = useCallback(
		(index: number) => {
			if (!position?.activePosition?.size || !market?.marketKey) return
			const option = CLOSE_PERCENT_OPTIONS[index]
			const percent = Math.abs(Number(option.replace('%', ''))) / 100
			const size =
				percent === 1
					? position.activePosition.size.abs()
					: floorNumber(position.activePosition.size.abs().mul(percent))

			const sizeDelta =
				position.activePosition?.side === PositionSide.LONG ? wei(size).neg() : wei(size)
			const decimals = sizeDelta.abs().eq(position.activePosition.size.abs()) ? undefined : 4

			dispatch(
				editClosePositionSizeDelta(market.marketKey, stripZeros(sizeDelta.toString(decimals)))
			)
		},
		[dispatch, position?.activePosition?.size, position?.activePosition?.side, market?.marketKey]
	)

	return (
		<StyledBaseModal title="Close full or partial position" isOpen onDismiss={onClose}>
			<Spacer height={10} />
			{accountType === FuturesMarginType.SMART_MARGIN && (
				<>
					<OrderTypeSelector orderType={orderType} setOrderTypeAction={setClosePositionOrderType} />
					<Spacer height={20} />
				</>
			)}

			<ClosePositionSizeInput maxNativeValue={maxNativeValue} />
			<SelectorButtons options={CLOSE_PERCENT_OPTIONS} onSelect={onSelectPercent} />

			{(orderType === 'limit' || orderType === 'stop_market') && (
				<>
					<Spacer height={20} />
					<ClosePositionPriceInput />
				</>
			)}
			<Spacer height={20} />

			<InfoBoxContainer>
				<InfoBoxRow
					boldValue
					title={t('futures.market.trade.edit-position.market')}
					textValue={market?.marketName}
				/>
				<InfoBoxRow
					textValueIcon={
						previewTrade?.leverage && (
							<PreviewArrow showPreview>{previewTrade.leverage.toString(2)}x</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.leverage-change')}
					textValue={
						position?.activePosition?.leverage
							? position.activePosition?.leverage.toString(2) + 'x'
							: '-'
					}
				/>
				<InfoBoxRow
					textValueIcon={
						previewTrade?.size && (
							<PreviewArrow showPreview>
								{previewTrade?.size
									? formatNumber(previewTrade.size.abs(), { suggestDecimals: true })
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.position-size')}
					textValue={formatNumber(position?.activePosition?.size || 0, { suggestDecimals: true })}
				/>
				<InfoBoxRow
					textValueIcon={
						previewTrade?.liqPrice && (
							<PreviewArrow showPreview>
								{formatDollars(previewTrade?.liqPrice, { suggestDecimals: true })}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.liquidation')}
					textValue={formatDollars(position?.activePosition?.liquidationPrice || 0)}
				/>
				<InfoBoxRow
					color={previewTrade?.exceedsPriceProtection ? 'negative' : 'primary'}
					title={t('futures.market.trade.edit-position.price-impact')}
					textValue={formatPercent(previewTrade?.priceImpact || 0, {
						suggestDecimals: true,
						maxDecimals: 4,
					})}
				/>
				<InfoBoxRow
					title={t('futures.market.trade.edit-position.fill-price')}
					textValue={formatDollars(previewTrade?.price || 0, {
						suggestDecimalsForAsset: market?.asset,
					})}
				/>
			</InfoBoxContainer>
			{previewTrade?.exceedsPriceProtection && (
				<>
					<Spacer height={20} />
					<AcceptWarningView
						message={t('futures.market.trade.confirmation.modal.slippage-warning')}
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
				onClick={submitCloseOrder}
			>
				{t('futures.market.trade.edit-position.submit-close')}
			</Button>

			{(orderError || transactionState?.error || ethBalWarningMessage) && (
				<ErrorView
					containerStyle={{ margin: '16px 0' }}
					messageType={ethBalWarningMessage ? 'warn' : 'error'}
					message={orderError || transactionState?.error || ethBalWarningMessage}
					formatter="revert"
				/>
			)}
			<Spacer height={20} />
			<ClosePositionFeeInfo />
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

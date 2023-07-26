import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide, PotentialTradeStatus } from '@kwenta/sdk/types'
import {
	floorNumber,
	formatDollars,
	formatNumber,
	formatPercent,
	stripZeros,
} from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useMemo } from 'react'
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
import { submitCrossMarginReducePositionOrder } from 'state/futures/crossMargin/actions'
import {
	selectCloseCMPositionOrderInputs,
	selectCloseCMPositionPreview,
} from 'state/futures/crossMargin/selectors'
import { selectSubmittingFuturesTx } from 'state/futures/selectors'
import {
	editClosePositionPrice,
	editClosePositionSizeDelta,
} from 'state/futures/smartMargin/actions'
import {
	selectEditPositionModalInfo,
	selectIsFetchingTradePreview,
	selectTradePreviewError,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import ClosePositionFeeInfo from '../FeeInfoBox/ClosePositionFeeInfo'

import ClosePositionSizeInput from './ClosePositionSizeInput'

const CLOSE_PERCENT_OPTIONS = ['25%', '50%', '75%', '100%']

// TODO: Share some logic between close modals

export default function CloseCrossMarginPositionModal() {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const transactionState = useAppSelector(selectTransaction)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview)
	const previewTrade = useAppSelector(selectCloseCMPositionPreview)
	const previewError = useAppSelector(selectTradePreviewError)
	const { nativeSizeDelta } = useAppSelector(selectCloseCMPositionOrderInputs)
	const { market, position } = useAppSelector(selectEditPositionModalInfo)

	const submitCloseOrder = useCallback(() => {
		dispatch(submitCrossMarginReducePositionOrder())
	}, [dispatch])

	const isLoading = useMemo(
		() => isSubmitting || isFetchingPreview,
		[isSubmitting, isFetchingPreview]
	)

	const maxNativeValue = useMemo(() => {
		return position?.size ?? ZERO_WEI
	}, [position?.size])

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

	const submitDisabled = useMemo(() => {
		return false
		return (
			sizeWei.eq(0) ||
			invalidSize ||
			isLoading ||
			orderError ||
			previewTrade?.status !== PotentialTradeStatus.OK
		)
	}, [sizeWei, invalidSize, isLoading, orderError, previewTrade?.status])

	const onClose = () => {
		if (market) {
			dispatch(editClosePositionSizeDelta(market.marketKey, ''))
			dispatch(editClosePositionPrice(market.marketKey, ''))
		}
		dispatch(setShowPositionModal(null))
	}

	const onSelectPercent = useCallback(
		(index: number) => {
			if (!position?.size || !market?.marketKey) return
			const option = CLOSE_PERCENT_OPTIONS[index]
			const percent = Math.abs(Number(option.replace('%', ''))) / 100
			const size =
				percent === 1 ? position.size.abs() : floorNumber(position.size.abs().mul(percent))

			const sizeDelta = position?.side === PositionSide.LONG ? wei(size).neg() : wei(size)
			const decimals = sizeDelta.abs().eq(position.size.abs()) ? undefined : 4

			dispatch(
				editClosePositionSizeDelta(market.marketKey, stripZeros(sizeDelta.toString(decimals)))
			)
		},
		[dispatch, position?.size, position?.side, market?.marketKey]
	)

	return (
		<StyledBaseModal title="Close full or partial position" isOpen onDismiss={onClose}>
			<Spacer height={10} />

			<ClosePositionSizeInput maxNativeValue={maxNativeValue} />
			<SelectorButtons options={CLOSE_PERCENT_OPTIONS} onSelect={onSelectPercent} />

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
					textValue={position?.leverage ? position.leverage?.toString(2) + 'x' : '-'}
				/>
				<InfoBoxRow
					textValueIcon={
						previewTrade?.sizeDelta && (
							<PreviewArrow showPreview>
								{previewTrade?.sizeDelta
									? formatNumber(previewTrade.sizeDelta.abs(), { suggestDecimals: true })
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.position-size')}
					textValue={formatNumber(position?.size || 0, { suggestDecimals: true })}
				/>
				<InfoBoxRow
					title={t('futures.market.trade.edit-position.price-impact')}
					textValue={formatPercent(previewTrade?.priceImpact || 0, {
						suggestDecimals: true,
						maxDecimals: 4,
					})}
				/>
				<InfoBoxRow
					title={t('futures.market.trade.edit-position.fill-price')}
					textValue={formatDollars(previewTrade?.price || 0, { suggestDecimals: true })}
				/>
			</InfoBoxContainer>

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

			{(orderError || transactionState?.error) && (
				<ErrorView
					containerStyle={{ margin: '16px 0' }}
					messageType={'error'}
					message={orderError || transactionState?.error}
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

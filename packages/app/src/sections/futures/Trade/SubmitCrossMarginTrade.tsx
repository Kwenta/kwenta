import { ZERO_WEI } from '@kwenta/sdk/constants'
import { isZero } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { ERROR_MESSAGES } from 'components/ErrorNotifier'
import Error from 'components/ErrorView'
import { previewErrorI18n } from 'queries/futures/constants'
import { setOpenModal } from 'state/app/reducer'
import { selectMarketIndexPrice, selectMarketPriceInfo } from 'state/futures/common/selectors'
import {
	selectCrossMarginAccount,
	selectSelectedCrossMarginPosition,
	selectCrossMarginTradeInputs,
	selectV3MarketInfo,
} from 'state/futures/crossMargin/selectors'
import { setTradePanelDrawerOpen } from 'state/futures/reducer'
import {
	selectMaxLeverage,
	selectLeverageSide,
	selectPendingDelayedOrder,
	selectMaxUsdSizeInput,
} from 'state/futures/selectors'
import {
	selectIsMarketCapReached,
	selectOrderType,
	selectPlaceOrderTranslationKey,
	selectSmartMarginLeverage,
	selectSmartMarginOrderPrice,
	selectTradePreview,
	selectTradePreviewError,
	selectTradePreviewStatus,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { FetchStatus } from 'state/types'
import { orderPriceInvalidLabel } from 'utils/futures'

const SubmitCrossMarginTradeButton: React.FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const { susdSize } = useAppSelector(selectCrossMarginTradeInputs)
	const maxLeverageValue = useAppSelector(selectMaxLeverage)
	const previewTrade = useAppSelector(selectTradePreview)
	const previewError = useAppSelector(selectTradePreviewError)
	const leverage = useAppSelector(selectSmartMarginLeverage)
	const orderType = useAppSelector(selectOrderType)
	const openOrder = useAppSelector(selectPendingDelayedOrder)
	const leverageSide = useAppSelector(selectLeverageSide)
	const maxUsdInputAmount = useAppSelector(selectMaxUsdSizeInput)
	const isMarketCapReached = useAppSelector(selectIsMarketCapReached)
	const placeOrderTranslationKey = useAppSelector(selectPlaceOrderTranslationKey)
	const orderPrice = useAppSelector(selectSmartMarginOrderPrice)
	const marketAssetRate = useAppSelector(selectMarketIndexPrice)
	const marketInfo = useAppSelector(selectV3MarketInfo)
	const indexPrice = useAppSelector(selectMarketPriceInfo)
	const previewStatus = useAppSelector(selectTradePreviewStatus)
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount)
	const position = useAppSelector(selectSelectedCrossMarginPosition)

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError))
		if (previewTrade?.statusMessage && previewTrade.statusMessage !== 'Success')
			return previewTrade?.statusMessage
		return null
	}, [previewTrade?.statusMessage, previewError, t])

	const increasingPosition =
		!position?.activePosition.side || position?.activePosition.side === leverageSide

	const onSubmit = useCallback(() => {
		dispatch(setTradePanelDrawerOpen(false))
		if (!crossMarginAccount) {
			dispatch(setOpenModal('futures_cross_margin_onboard'))
			return
		}
		dispatch(setOpenModal('futures_confirm_cross_margin_trade'))
	}, [crossMarginAccount, dispatch])

	// TODO: Clean up errors and warnings and share logic with smart margin

	const placeOrderDisabledReason = useMemo<{
		message: string
		show?: 'warn' | 'error'
	} | null>(() => {
		if (orderError) {
			return { message: orderError, show: 'error' }
		}
		const maxLeverage = marketInfo?.appMaxLeverage ?? wei(1)

		const indexPriceWei = indexPrice?.price ?? ZERO_WEI
		const canLiquidate =
			(previewTrade?.size.gt(0) && indexPriceWei.lt(previewTrade?.liqPrice)) ||
			(previewTrade?.size.lt(0) && indexPriceWei.gt(previewTrade?.liqPrice))
		if (canLiquidate) {
			return {
				show: 'warn',
				message: `Position can be liquidated`,
			}
		}

		if (leverage.gt(maxLeverageValue))
			return {
				show: 'warn',
				message: `Max leverage ${maxLeverage.toString(0)}x exceeded`,
			}
		if (marketInfo?.isSuspended)
			return {
				show: 'warn',
				message: `Market suspended`,
			}
		if (isMarketCapReached && increasingPosition)
			return {
				show: 'warn',
				message: `Open interest limit exceeded`,
			}

		const invalidReason = orderPriceInvalidLabel(
			orderPrice,
			leverageSide,
			marketAssetRate,
			orderType
		)

		if ((orderType === 'limit' || orderType === 'stop_market') && !!invalidReason)
			return {
				show: 'warn',
				message: invalidReason,
			}
		if (susdSize.gt(maxUsdInputAmount))
			return {
				show: 'warn',
				message: 'Max trade size exceeded',
			}
		if (placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum')
			return {
				show: 'warn',
				message: 'Min $50 margin required',
			}

		if (isZero(susdSize)) {
			return { message: 'Trade size required' }
		}
		if (orderType === 'market' && !!openOrder && !openOrder.isStale) {
			return {
				show: 'warn',
				message: ERROR_MESSAGES.ORDER_PENDING,
			}
		}

		return null
	}, [
		susdSize,
		orderType,
		openOrder,
		orderError,
		orderPrice,
		leverageSide,
		marketAssetRate,
		marketInfo?.isSuspended,
		placeOrderTranslationKey,
		maxUsdInputAmount,
		isMarketCapReached,
		increasingPosition,
		maxLeverageValue,
		leverage,
		indexPrice,
		previewTrade,
		marketInfo?.appMaxLeverage,
	])

	return (
		<>
			<div>
				<ManagePositionContainer>
					<PlaceOrderButton
						data-testid="trade-panel-submit-button"
						noOutline
						fullWidth
						loading={previewStatus.status === FetchStatus.Loading}
						variant={leverageSide}
						disabled={!!placeOrderDisabledReason}
						onClick={onSubmit}
					>
						{t(placeOrderTranslationKey)}
					</PlaceOrderButton>
				</ManagePositionContainer>
			</div>

			{placeOrderDisabledReason?.show ? (
				<Error
					message={placeOrderDisabledReason.message}
					messageType={placeOrderDisabledReason.show}
				/>
			) : null}
		</>
	)
}

const ManagePositionContainer = styled.div`
	display: flex;
	grid-gap: 15px;
	margin-bottom: 16px;
`

const PlaceOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
`

export default SubmitCrossMarginTradeButton

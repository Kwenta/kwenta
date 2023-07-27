import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import {
	getDisplayAsset,
	OrderNameByType,
	formatCurrency,
	formatDollars,
	formatPercent,
	formatNumber,
} from '@kwenta/sdk/utils'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import Error from 'components/ErrorView'
import { ButtonLoader } from 'components/Loader'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import Spacer from 'components/Spacer'
import Tooltip from 'components/Tooltip/Tooltip'
import { setOpenModal } from 'state/app/reducer'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { submitCrossMarginOrder } from 'state/futures/crossMargin/actions'
import {
	selectCrossMarginTradeInputs,
	selectCrossMarginTradePreview,
	selectV3MarketInfo,
} from 'state/futures/crossMargin/selectors'
import {
	selectLeverageSide,
	selectModifyPositionError,
	selectNextPriceDisclaimer,
	selectPosition,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { getKnownError } from 'utils/formatters/error'

import BaseDrawer from '../MobileTrade/drawers/BaseDrawer'

import TradeConfirmationRow from './TradeConfirmationRow'
import TradeConfirmationSummary from './TradeConfirmationSummary'

const CrossMarginOrderConfirmationModal: FC = () => {
	const { t } = useTranslation()
	const isDisclaimerDisplayed = useAppSelector(selectNextPriceDisclaimer)
	const dispatch = useAppDispatch()

	const { nativeSizeDelta } = useAppSelector(selectCrossMarginTradeInputs)
	const txError = useAppSelector(selectModifyPositionError)
	const leverageSide = useAppSelector(selectLeverageSide)
	const position = useAppSelector(selectPosition)
	const marketInfo = useAppSelector(selectV3MarketInfo)
	const marketAsset = useAppSelector(selectMarketAsset)
	const submitting = useAppSelector(selectSubmittingFuturesTx)
	const preview = useAppSelector(selectCrossMarginTradePreview)
	const settlementStrategy = marketInfo?.settlementStrategies[0]

	const positionSize = useMemo(() => {
		const positionDetails = position?.position
		return positionDetails
			? positionDetails.size.mul(positionDetails.side === PositionSide.LONG ? 1 : -1)
			: ZERO_WEI
	}, [position])

	const orderDetails = useMemo(() => {
		return { nativeSizeDelta, size: (positionSize ?? ZERO_WEI).add(nativeSizeDelta).abs() }
	}, [nativeSizeDelta, positionSize])

	const isClosing = useMemo(() => {
		return orderDetails.size.eq(ZERO_WEI)
	}, [orderDetails])

	const totalDeposit = useMemo(() => {
		return (preview?.fee ?? ZERO_WEI).add(preview?.settlementFee ?? ZERO_WEI)
	}, [preview?.fee, preview?.settlementFee])

	const dataRows = useMemo(
		() => [
			{
				label: t('futures.market.user.position.modal.estimated-fill'),
				tooltipContent: t('futures.market.trade.delayed-order.description'),
				value: formatDollars(preview?.fillPrice ?? ZERO_WEI, {
					suggestDecimals: true,
				}),
			},
			{
				label: t('futures.market.user.position.modal.estimated-price-impact'),
				value: `${formatPercent(preview?.priceImpact ?? ZERO_WEI)}`,
				color: preview?.priceImpact?.abs().gt(0.45) // TODO: Make this configurable
					? 'red'
					: '',
			},
			{
				label: t('futures.market.user.position.modal.time-delay'),
				value: `${formatNumber(
					settlementStrategy?.settlementDelay ? settlementStrategy.settlementDelay : ZERO_WEI,
					{
						maxDecimals: 0,
					}
				)} sec`,
			},
			{
				label: t('futures.market.user.position.modal.fee-estimated'),
				tooltipContent: t('futures.market.trade.fees.tooltip'),
				value: formatDollars(preview?.fee ?? ZERO_WEI, {
					minDecimals: 2,
				}),
			},
			{
				label: t('futures.market.user.position.modal.keeper-deposit'),
				tooltipContent: t('futures.market.trade.fees.keeper-tooltip'),
				value: formatDollars(preview?.settlementFee ?? ZERO_WEI, {
					minDecimals: 2,
				}),
			},
			{
				label: t('futures.market.user.position.modal.deposit'),
				tooltipContent: t('futures.market.trade.confirmation.modal.delayed-disclaimer'),
				value: formatDollars(totalDeposit),
			},
		],
		[t, preview, totalDeposit, preview?.settlementFee, settlementStrategy?.settlementDelay]
	)

	const mobileRows = useMemo(() => {
		return [
			{
				label: t('futures.market.user.position.modal.size'),
				value: formatCurrency(
					getDisplayAsset(marketAsset) || '',
					orderDetails.nativeSizeDelta.abs() ?? ZERO_WEI,
					{
						currencyKey: getDisplayAsset(marketAsset) ?? '',
					}
				),
			},
			{
				label: t('futures.market.user.position.modal.side'),
				value: (leverageSide ?? PositionSide.LONG).toUpperCase(),
			},
			{
				label: t('futures.market.user.position.modal.order-type'),
				value: OrderNameByType['market'],
			},
			...dataRows,
		]
	}, [t, dataRows, marketAsset, leverageSide, orderDetails.nativeSizeDelta])

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	const handleConfirmOrder = () => {
		dispatch(submitCrossMarginOrder())
	}

	return (
		<>
			<DesktopOnlyView>
				<StyledBaseModal
					onDismiss={onDismiss}
					isOpen
					title={
						isClosing
							? t('futures.market.trade.confirmation.modal.close-order')
							: t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
					}
				>
					<Spacer height={12} />
					<TradeConfirmationSummary
						marketAsset={marketAsset}
						nativeSizeDelta={orderDetails.nativeSizeDelta}
						leverageSide={leverageSide}
						orderType={'market'}
						leverage={preview?.leverage ?? ZERO_WEI}
					/>
					{dataRows.map((row, i) => (
						<TradeConfirmationRow key={`datarow-${i}`} className={i === 0 ? '' : 'border'}>
							{row.tooltipContent ? (
								<Tooltip
									height="auto"
									width="250px"
									content={row.tooltipContent}
									style={{ textTransform: 'none' }}
								>
									<Label>
										{row.label}
										<StyledHelpIcon />
									</Label>
								</Tooltip>
							) : (
								<Label>{row.label}</Label>
							)}
							<Value>
								<span className={`value ${row.color ?? ''}`}>{row.value}</span>
							</Value>
						</TradeConfirmationRow>
					))}
					{isDisclaimerDisplayed && (
						<Disclaimer>
							{t('futures.market.trade.confirmation.modal.max-leverage-disclaimer')}
						</Disclaimer>
					)}
					<ConfirmTradeButton
						disabled={submitting}
						variant={isClosing ? 'flat' : leverageSide}
						onClick={handleConfirmOrder}
					>
						{submitting ? (
							<ButtonLoader />
						) : isClosing ? (
							t('futures.market.trade.confirmation.modal.close-order')
						) : (
							t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
						)}
					</ConfirmTradeButton>
					{txError && <Error message={getKnownError(txError)} formatter="revert" />}
				</StyledBaseModal>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BaseDrawer
					open
					items={mobileRows}
					closeDrawer={onDismiss}
					buttons={
						<ConfirmTradeButtonMobile
							disabled={submitting}
							variant={isClosing ? 'flat' : leverageSide}
							onClick={handleConfirmOrder}
						>
							{submitting ? (
								<ButtonLoader />
							) : isClosing ? (
								t('futures.market.trade.confirmation.modal.close-order')
							) : (
								t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
							)}
						</ConfirmTradeButtonMobile>
					}
				/>
			</MobileOrTabletView>
		</>
	)
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`

const Label = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	text-transform: capitalize;
	display: flex;
	flex-direction: row;
	gap: 4px;
	align-items: center;
`

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 12px;
	text-transform: capitalize;

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
`

const ConfirmTradeButtonMobile = styled(ConfirmTradeButton)`
	width: 100%;
`

const Disclaimer = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	margin-top: 12px;
	margin-bottom: 12px;
`

const StyledHelpIcon = styled(HelpIcon)`
	margin-bottom: -1px;
`

export default CrossMarginOrderConfirmationModal

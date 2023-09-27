import { MIN_MARGIN_AMOUNT, ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import {
	OrderNameByType,
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
	stripZeros,
} from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { FlexDivRowCentered } from 'components/layout/flex'
import { ButtonLoader } from 'components/Loader'
import { StyledCaretDownIcon } from 'components/Select'
import Spacer from 'components/Spacer'
import Tooltip from 'components/Tooltip/Tooltip'
import { NO_VALUE } from 'constants/placeholder'
import { selectMarketAsset } from 'state/futures/common/selectors'
import {
	selectLeverageSide,
	selectPosition,
	selectLeverageInput,
	selectTradePanelSLTPValidity,
} from 'state/futures/selectors'
import { refetchTradePreview, submitSmartMarginOrder } from 'state/futures/smartMargin/actions'
import {
	selectKeeperDepositExceedsBal,
	selectNewTradeHasSlTp,
	selectOrderType,
	selectSlTpTradeInputs,
	selectSelectedSwapDepositToken,
	selectSmartMarginOrderPrice,
	selectTradePreview,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks'

import AcceptWarningView from '../../../components/AcceptWarningView'

import TradeConfirmationRow from './TradeConfirmationRow'
import TradeConfirmationSummary from './TradeConfirmationSummary'

type Props = {
	gasFee?: Wei | null
	keeperFee?: Wei | null
	executionFee: Wei
	errorMessage?: string | null | undefined
	isSubmitting?: boolean
	allowanceValid?: boolean
	onApproveAllowance: () => any
	onDismiss: () => void
}

export default function TradeConfirmationModal({
	gasFee,
	keeperFee,
	executionFee,
	errorMessage,
	isSubmitting,
	allowanceValid,
	onApproveAllowance,
	onDismiss,
}: Props) {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const marketAsset = useAppSelector(selectMarketAsset)
	const potentialTradeDetails = useAppSelector(selectTradePreview)
	const orderType = useAppSelector(selectOrderType)
	const position = useAppSelector(selectPosition)
	const leverageSide = useAppSelector(selectLeverageSide)
	const leverageInput = useAppSelector(selectLeverageInput)
	const ethBalanceExceeded = useAppSelector(selectKeeperDepositExceedsBal)
	const hasSlTp = useAppSelector(selectNewTradeHasSlTp)
	const sltpValidity = useAppSelector(selectTradePanelSLTPValidity)

	const [overridePriceProtection, setOverridePriceProtection] = useState(false)
	const [acceptedSLRisk, setAcceptedSLRisk] = useState(false)

	usePollAction('refresh_preview', refetchTradePreview, { intervalTime: 6000 })

	const onConfirmOrder = useCallback(() => dispatch(submitSmartMarginOrder(true)), [dispatch])

	const positionSide = useMemo(() => {
		if (potentialTradeDetails?.size.eq(ZERO_WEI)) {
			return position?.activePosition?.side === PositionSide.LONG
				? PositionSide.SHORT
				: PositionSide.LONG
		}
		return potentialTradeDetails?.size.gte(ZERO_WEI) ? PositionSide.LONG : PositionSide.SHORT
	}, [potentialTradeDetails?.size, position?.activePosition])

	const positionDetails = useMemo(() => {
		return potentialTradeDetails
			? {
					...potentialTradeDetails,
					side: positionSide,
					leverage: potentialTradeDetails.margin.eq(ZERO_WEI)
						? ZERO_WEI
						: potentialTradeDetails.size
								.mul(potentialTradeDetails.price)
								.div(potentialTradeDetails.margin)
								.abs(),
			  }
			: null
	}, [potentialTradeDetails, positionSide])

	const showEthBalWarning = useMemo(() => {
		return ethBalanceExceeded && (orderType !== 'market' || hasSlTp)
	}, [ethBalanceExceeded, orderType, hasSlTp])

	const ethBalWarningMessage = showEthBalWarning
		? t('futures.market.trade.confirmation.modal.eth-bal-warning')
		: null

	const disabledReason = useMemo(() => {
		if (showEthBalWarning) {
			return t('futures.market.trade.confirmation.modal.disabled-eth-bal', {
				depositAmount: formatNumber(stripZeros(keeperFee?.toString()), { suggestDecimals: true }),
			})
		}
		if (positionDetails?.exceedsPriceProtection && !overridePriceProtection) {
			return t('futures.market.trade.confirmation.modal.disabled-exceeds-price-protection')
		}
		if (positionDetails?.margin.lt(MIN_MARGIN_AMOUNT))
			return t('futures.market.trade.confirmation.modal.disabled-min-margin')
	}, [
		positionDetails?.margin,
		t,
		showEthBalWarning,
		keeperFee,
		overridePriceProtection,
		positionDetails?.exceedsPriceProtection,
	])

	const handleDismiss = useCallback(() => {
		onDismiss()
	}, [onDismiss])

	const buttonText = allowanceValid
		? t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)
		: t(`futures.market.trade.confirmation.modal.approve-order`, { asset: 'sUSD' })

	return (
		<StyledBaseModal
			onDismiss={handleDismiss}
			isOpen
			title={t(`futures.market.trade.confirmation.modal.confirm-order.${leverageSide}`)}
		>
			<Spacer height={8} />
			<TradeConfirmationSummary
				marketAsset={marketAsset}
				nativeSizeDelta={potentialTradeDetails?.sizeDelta ?? ZERO_WEI}
				leverageSide={leverageSide}
				orderType={orderType}
				leverage={wei(leverageInput || '0')}
			/>
			<RowsContainer>
				<SLTPRows />
				<LiquidationPriceRow />
				<ResultingLeverageRow />
				<ResultingMarginRow />
				{orderType === 'limit' || orderType === 'stop_market' ? (
					<OrderPriceRow />
				) : (
					<EstimatedFillPriceRow />
				)}
				<PriceImpactRow />
				<TotalFeeRow executionFee={executionFee} />
				<KeeperFeeRow keeperFee={keeperFee} />
				<GasFeeRow gasFee={gasFee} />
			</RowsContainer>
			{positionDetails?.exceedsPriceProtection && (
				<AcceptWarningView
					id="pp-override"
					style={{ margin: '10px 0 0 0' }}
					message={t('futures.market.trade.confirmation.modal.slippage-warning')}
					checked={overridePriceProtection}
					onChangeChecked={(checked) => setOverridePriceProtection(checked)}
				/>
			)}
			{sltpValidity.stopLoss.showWarning && (
				<AcceptWarningView
					id="sl-risk-warning"
					style={{ margin: '10px 0 0 0' }}
					message={t('futures.market.trade.confirmation.modal.stop-loss-warning')}
					checked={acceptedSLRisk}
					onChangeChecked={(checked) => setAcceptedSLRisk(checked)}
				/>
			)}
			<ConfirmTradeButton
				data-testid="trade-confirm-order-button"
				variant={isSubmitting ? 'flat' : leverageSide}
				onClick={allowanceValid ? onConfirmOrder : onApproveAllowance}
				className={leverageSide}
				disabled={
					!positionDetails ||
					isSubmitting ||
					!!disabledReason ||
					(sltpValidity.stopLoss.showWarning && !acceptedSLRisk)
				}
			>
				{isSubmitting ? <ButtonLoader /> : disabledReason || buttonText}
			</ConfirmTradeButton>
			{(errorMessage || ethBalWarningMessage) && (
				<ErrorView
					messageType={ethBalWarningMessage ? 'warn' : 'error'}
					message={errorMessage ?? ethBalWarningMessage}
					containerStyle={{ margin: '16px 0 0 0' }}
				/>
			)}
		</StyledBaseModal>
	)
}

type DataRowProps = {
	label: string
	value: React.ReactNode
	tooltipContent?: string
	color?: string
	expanded?: boolean
	children?: React.ReactNode
	onToggleExpand?: () => void
}

const DataRow: FC<DataRowProps> = ({
	label,
	value,
	tooltipContent,
	color,
	expanded,
	children,
	onToggleExpand,
}) => {
	return (
		<>
			<TradeConfirmationRow>
				{tooltipContent ? (
					<Tooltip
						height="auto"
						preset="bottom"
						width="300px"
						content={tooltipContent}
						style={{ padding: 10, textTransform: 'none', left: '80%' }}
					>
						<Label>
							{label}
							<StyledHelpIcon />
						</Label>
					</Tooltip>
				) : (
					<FlexDivRowCentered columnGap="5px" onClick={onToggleExpand}>
						<Label>{label}</Label>
						{onToggleExpand ? <StyledCaretDownIcon width={9} $flip={expanded} /> : null}
					</FlexDivRowCentered>
				)}

				<Value>
					<span className={color ? `value ${color}` : ''}>{value}</span>
				</Value>
			</TradeConfirmationRow>
			{expanded ? children : null}
		</>
	)
}

const SLTPRows = () => {
	const { stopLossPrice, takeProfitPrice } = useAppSelector(selectSlTpTradeInputs)

	return (
		<>
			<DataRow
				label="stop loss"
				value={stopLossPrice ? formatDollars(stopLossPrice, { suggestDecimals: true }) : NO_VALUE}
			/>

			<DataRow
				label="take profit"
				value={
					takeProfitPrice ? formatDollars(takeProfitPrice, { suggestDecimals: true }) : NO_VALUE
				}
			/>
		</>
	)
}

const LiquidationPriceRow = () => {
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	return (
		<DataRow
			label="liquidation price"
			color="red"
			value={formatDollars(potentialTradeDetails?.liqPrice ?? ZERO_WEI, { suggestDecimals: true })}
		/>
	)
}

const ResultingLeverageRow = () => {
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	const leverage = potentialTradeDetails
		? potentialTradeDetails.margin.eq(ZERO_WEI)
			? ZERO_WEI
			: potentialTradeDetails.size
					.mul(potentialTradeDetails.price)
					.div(potentialTradeDetails.margin)
					.abs()
		: null

	return <DataRow label="resulting leverage" value={`${formatNumber(leverage ?? ZERO_WEI)}x`} />
}

const ResultingMarginRow = () => {
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	return (
		<DataRow
			label="resulting margin"
			value={formatDollars(potentialTradeDetails?.margin ?? ZERO_WEI)}
		/>
	)
}

const OrderPriceRow = () => {
	const orderType = useAppSelector(selectOrderType)
	const orderPrice = useAppSelector(selectSmartMarginOrderPrice)

	return (
		<DataRow
			label={OrderNameByType[orderType] + ' order price'}
			value={formatDollars(orderPrice, { suggestDecimals: true })}
		/>
	)
}

const EstimatedFillPriceRow = () => {
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	return (
		<DataRow
			label="Est. fill price"
			value={formatDollars(potentialTradeDetails?.price ?? ZERO_WEI, { suggestDecimals: true })}
		/>
	)
}

const PriceImpactRow = () => {
	const { t } = useTranslation()
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	return (
		<DataRow
			label="price impact"
			tooltipContent={t('futures.market.trade.delayed-order.description')}
			value={formatPercent(potentialTradeDetails?.priceImpact ?? ZERO_WEI, {
				suggestDecimals: true,
				maxDecimals: 4,
			})}
			color={potentialTradeDetails?.exceedsPriceProtection ? 'red' : ''}
		/>
	)
}

type TotalFeeRowProps = {
	executionFee: Wei
}

const TotalFeeRow: FC<TotalFeeRowProps> = ({ executionFee }) => {
	const potentialTradeDetails = useAppSelector(selectTradePreview)

	const totalFee = useMemo(
		() => potentialTradeDetails?.fee.add(executionFee) ?? executionFee,
		[potentialTradeDetails?.fee, executionFee]
	)

	return <DataRow label="total fee" value={formatDollars(totalFee)} />
}

type KeeperFeeRowProps = {
	keeperFee?: Wei | null
}

const KeeperFeeRow: FC<KeeperFeeRowProps> = ({ keeperFee }) => {
	if (!keeperFee) return null

	return (
		<DataRow
			label="Keeper ETH deposit"
			value={formatCurrency('ETH', keeperFee, { currencyKey: 'ETH' })}
		/>
	)
}

type GasFeeRowProps = {
	gasFee?: Wei | null
}

const GasFeeRow: FC<GasFeeRowProps> = ({ gasFee }) => {
	if (gasFee?.gt(0)) {
		return <DataRow label="network gas fee" value={formatDollars(gasFee)} />
	}

	return null
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`

const RowsContainer = styled.div`
	margin-top: 6px;
`

const Label = styled.div`
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 12px;
	text-transform: capitalize;
`

const Value = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	font-size: 12px;

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.yellow};
	}
`

const ConfirmTradeButton = styled(Button)`
	margin-top: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 55px;
	font-size: 15px;
`

export const MobileConfirmTradeButton = styled(Button)`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	height: 45px;
	width: 100%;
	font-size: 15px;
`

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`

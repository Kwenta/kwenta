import { ZERO_WEI } from '@kwenta/sdk/constants'
import { SmartMarginOrderType } from '@kwenta/sdk/types'
import { formatCurrency, formatDollars, formatPercent } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { memo, useMemo, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import { InfoBoxRow } from 'components/InfoBox'
import Tooltip from 'components/Tooltip/Tooltip'
import { NO_VALUE } from 'constants/placeholder'

const ExecutionFeeTooltip = memo(() => {
	const { t } = useTranslation()

	return (
		<Tooltip
			height="auto"
			preset="top"
			width="240px"
			content={t('futures.market.trade.fees.keeper-tooltip')}
			style={{ textTransform: 'none' }}
		>
			<StyledHelpIcon />
		</Tooltip>
	)
})

const ExecutionFeeRow = memo(({ executionFee }: { executionFee: Wei }) => {
	return (
		<InfoBoxRow
			title="Execution Fee"
			textValue={!!executionFee ? formatDollars(executionFee) : NO_VALUE}
			keyNode={<ExecutionFeeTooltip />}
			isSubItem
		/>
	)
})

export const KeeperDepositRow = memo(
	({
		smartMarginKeeperDeposit,
		isSubItem,
	}: {
		smartMarginKeeperDeposit: Wei
		isSubItem?: boolean
	}) => {
		return (
			<InfoBoxRow
				title="Keeper Deposit"
				isSubItem={isSubItem}
				textValue={
					smartMarginKeeperDeposit.gt(0)
						? formatCurrency('ETH', smartMarginKeeperDeposit, { currencyKey: 'ETH' })
						: NO_VALUE
				}
			/>
		)
	}
)

const EstimatedTradeFeeRow = memo(({ rates, tradeFee }: { rates: FeeRates; tradeFee?: Wei }) => {
	return (
		<InfoBoxRow
			title={`Est. Trade Fee (${formatPercent(rates.maker)} / ${formatPercent(rates.taker)})`}
			textValue={!!tradeFee ? formatDollars(tradeFee, { suggestDecimals: true }) : NO_VALUE}
			keyNode={<MarketCostTooltip />}
			isSubItem
		/>
	)
})

const MarketCostTooltip = memo(() => {
	const { t } = useTranslation()

	return (
		<Tooltip
			height="auto"
			preset="top"
			width="300px"
			content={t('futures.market.trade.fees.tooltip')}
			style={{ textTransform: 'none' }}
		>
			<StyledHelpIcon />
		</Tooltip>
	)
})

type FeeRates = {
	maker: Wei
	taker: Wei
}

type FeesRowProps = {
	tradeFee: Wei
	orderType: SmartMarginOrderType
	smartMarginKeeperDeposit?: Wei
	executionFee: Wei
	rates: FeeRates
}

const FeeRows = memo(
	({ tradeFee, smartMarginKeeperDeposit, orderType, executionFee, rates }: FeesRowProps) => {
		const [expanded, toggleExpanded] = useReducer((s) => !s, false)

		const totalFee = useMemo(() => {
			return tradeFee.add(executionFee ?? ZERO_WEI)
		}, [tradeFee, executionFee])

		return (
			<InfoBoxRow
				title="Total Fees"
				textValue={formatDollars(totalFee)}
				expandable
				expanded={expanded}
				onToggleExpand={toggleExpanded}
			>
				<ExecutionFeeRow executionFee={executionFee} />
				<EstimatedTradeFeeRow rates={rates} tradeFee={tradeFee} />
				{(orderType === 'limit' || orderType === 'stop_market') && smartMarginKeeperDeposit && (
					<KeeperDepositRow isSubItem smartMarginKeeperDeposit={smartMarginKeeperDeposit} />
				)}
			</InfoBoxRow>
		)
	}
)

export default FeeRows

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 4px;
`

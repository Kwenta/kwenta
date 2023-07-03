import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TimerIcon from 'assets/svg/app/timer.svg'
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox'
import Tooltip from 'components/Tooltip/Tooltip'
import { NO_VALUE } from 'constants/placeholder'
import useIsL1 from 'hooks/useIsL1'
import useIsL2 from 'hooks/useIsL2'
import { selectGasPrice } from 'state/app/selectors'
import {
	selectTransactionFeeWei,
	selectFeeCostWei,
	selectSlippagePercentWei,
} from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'

const PriceImpactRow = () => {
	const { t } = useTranslation()
	const slippagePercent = useAppSelector(selectSlippagePercentWei)

	return (
		<InfoBoxRow
			title={t('exchange.currency-card.price-impact')}
			textValue={slippagePercent.lt(0) ? formatPercent(slippagePercent) : NO_VALUE}
		/>
	)
}

const FeeCostRow = () => {
	const { t } = useTranslation()
	const feeCost = useAppSelector(selectFeeCostWei)

	return (
		<InfoBoxRow
			title={t('common.summary.fee-cost')}
			textValue={!!feeCost ? formatDollars(feeCost, { suggestDecimals: true }) : NO_VALUE}
		/>
	)
}

const FeeRow = () => {
	const { t } = useTranslation()
	const { exchangeFeeRate, baseFeeRate } = useAppSelector(({ exchange }) => ({
		exchangeFeeRate: exchange.exchangeFeeRate,
		baseFeeRate: exchange.baseFeeRate,
	}))

	return (
		<InfoBoxRow
			title={t('exchange.summary-info.fee')}
			nodeValue={
				<div style={{ display: 'flex' }}>
					{formatPercent(baseFeeRate ?? ZERO_WEI)}
					{exchangeFeeRate != null && baseFeeRate != null ? (
						wei(exchangeFeeRate)
							.sub(baseFeeRate ?? 0)
							.gt(0) ? (
							<>
								{' + '}
								<Tooltip
									height="auto"
									preset="bottom"
									width="300px"
									content="This transaction will incur an additional dynamic fee due to market volatility."
									style={{ padding: 10, textTransform: 'none' }}
								>
									<StyledDynamicFee>
										{formatPercent(wei(exchangeFeeRate).sub(baseFeeRate), { minDecimals: 2 })}
									</StyledDynamicFee>
									<StyledTimerIcon />
								</Tooltip>
							</>
						) : null
					) : null}
				</div>
			}
		/>
	)
}

const GasPriceRow = () => {
	const { t } = useTranslation()
	const customGasPrice = useAppSelector(selectGasPrice)
	const isL2 = useIsL2()
	const isMainnet = useIsL1()
	const transactionFee = useAppSelector(selectTransactionFeeWei)

	const formattedTransactionFee = React.useMemo(() => {
		return transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE
	}, [transactionFee])

	const gasPriceItem = isL2
		? formattedTransactionFee
		: `${formatNumber(+customGasPrice, { minDecimals: 2 })} Gwei`

	return (
		<InfoBoxRow
			title={
				isMainnet
					? t('common.summary.gas-prices.max-fee')
					: t('common.summary.gas-prices.gas-price')
			}
			textValue={gasPriceItem}
		/>
	)
}

const SwapInfoBox: React.FC = () => {
	return (
		<SwapInfoBoxContainer>
			<GasPriceRow />
			<PriceImpactRow />
			<FeeRow />
			<FeeCostRow />
		</SwapInfoBoxContainer>
	)
}

const SwapInfoBoxContainer = styled(InfoBoxContainer)`
	margin-bottom: 15px;
`

const StyledDynamicFee = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	margin-left: 5px;
`

const StyledTimerIcon = styled(TimerIcon)`
	margin-left: 5px;
	path {
		fill: ${(props) => props.theme.colors.selectedTheme.yellow};
	}
`

export default SwapInfoBox

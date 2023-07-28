import { formatCurrency, formatPercent } from '@kwenta/sdk/utils'
import React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Body } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { selectMarketInfo } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

import OpenInterestBar from './OpenInterestBar'

const DEFAULT_DATA = {
	short: 0,
	long: 0,
	shortValue: 0,
	longValue: 0,
	shortText: '',
	longText: '',
}

const SkewInfo: React.FC = () => {
	const { t } = useTranslation()

	const marketInfo = useAppSelector(selectMarketInfo)
	const marketAsset = useAppSelector(selectMarketAsset)

	const data = useMemo(() => {
		return marketInfo?.openInterest
			? {
					short: marketInfo?.openInterest.shortPct,
					long: marketInfo?.openInterest.longPct,
					shortValue: marketInfo?.openInterest.shortUSD,
					longValue: marketInfo?.openInterest.longUSD,
					shortText: formatCurrency(marketAsset, marketInfo?.openInterest.shortUSD, {
						sign: '$',
						minDecimals: 0,
					}),
					longText: formatCurrency(marketAsset, marketInfo?.openInterest.longUSD, {
						sign: '$',
						minDecimals: 0,
					}),
			  }
			: DEFAULT_DATA
	}, [marketInfo, marketAsset])

	return (
		<SkewContainer>
			<SkewHeader>
				<SkewTooltip preset="bottom-right" content={data.shortText ?? 0} mono>
					<WithCursor cursor="help">
						<SkewValue>{formatPercent(data.short, { minDecimals: 0 })}</SkewValue>
					</WithCursor>
				</SkewTooltip>
				<SkewTooltip preset="bottom" content={t('futures.market.history.skew-tooltip')}>
					<WithCursor cursor="help">
						<SkewLabel>{t('futures.market.history.skew-label')}</SkewLabel>
					</WithCursor>
				</SkewTooltip>
				<SkewTooltip preset="bottom-right" content={data.longText ?? 0} mono>
					<WithCursor cursor="help">
						<SkewValue>{formatPercent(data.long, { minDecimals: 0 })}</SkewValue>
					</WithCursor>
				</SkewTooltip>
			</SkewHeader>
			<OpenInterestBar skew={data} />
		</SkewContainer>
	)
}

export default SkewInfo

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`

const SkewTooltip = styled(Tooltip).attrs({ width: '310px', height: 'auto' })`
	left: -30px;
	z-index: 2;
	padding: 10px;
	color: red;
`

const SkewContainer = styled.div`
	height: 55px;
	display: flex;
	flex-direction: column;
	column-gap: 5px;
	align-items: center;

	width: 100%;
	padding: 10px;
	margin-bottom: 16px;
	box-sizing: border-box;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	p,
	span {
		text-align: left;
	}
`

const SkewHeader = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 5px;
`

const SkewLabel = styled(Body).attrs({ as: 'span' })`
	text-transform: capitalize;
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

const SkewValue = styled(Body).attrs({ mono: true })`
	text-align: center;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

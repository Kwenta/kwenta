import { ZERO_WEI } from '@kwenta/sdk/constants'
import { getDisplayAsset, formatDollars, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { getColorFromPriceChange } from 'components/ColoredPrice'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import useWindowSize from 'hooks/useWindowSize'
import { selectMarketAsset, selectMarketPriceInfo } from 'state/futures/common/selectors'
import {
	selectMarketInfo,
	selectSelectedInputHours,
	selectSkewAdjustedPriceInfo,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { selectPreviousDayPrices } from 'state/prices/selectors'
import media from 'styles/media'

import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles'

import ChartToggle from './ChartToggle'
import HistoryToggle from './HistoryToggle'
import HoursToggle from './HoursToggle'
import MarketDetail, { MarketDetailValue } from './MarketDetail'
import { MarketDataKey } from './utils'

type MarketDetailsProps = {
	mobile?: boolean
}

interface OpenInterestDetailProps extends MarketDetailsProps {
	isLong?: boolean
}

const MarketDetails: React.FC<MarketDetailsProps> = () => {
	const { deviceType } = useWindowSize()
	const mobileOrTablet = deviceType !== 'desktop'

	const SelectedMarketDetailsView = mobileOrTablet ? (
		<MarketDetailsContainer mobile={mobileOrTablet}>
			<IndexPriceDetail mobile={mobileOrTablet} />
			<MarketSkew mobile={mobileOrTablet} />
			<HourlyFundingDetail mobile={mobileOrTablet} />
			<MarketPriceDetail mobile={mobileOrTablet} />
			<DailyChangeDetail mobile={mobileOrTablet} />
			<FlexDivRow columnGap="25px">
				<OpenInterestDetail isLong mobile={mobileOrTablet} />
				<OpenInterestDetail mobile={mobileOrTablet} />
			</FlexDivRow>
		</MarketDetailsContainer>
	) : (
		<MarketDetailsContainer>
			<MarketPriceDetail />
			<IndexPriceDetail />
			<DailyChangeDetail />
			<OpenInterestDetail isLong />
			<OpenInterestDetail />
			<MarketSkew />
			<HourlyFundingDetail />
		</MarketDetailsContainer>
	)

	return (
		<MainContainer mobile={mobileOrTablet}>
			{SelectedMarketDetailsView}
			{!mobileOrTablet && (
				<ToggleContainer justifyContent="flex-end" columnGap="30px">
					<ChartToggle />
					<HistoryToggle />
				</ToggleContainer>
			)}
		</MainContainer>
	)
}

const MarketPriceDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const markPrice = useAppSelector(selectSkewAdjustedPriceInfo)
	const asset = useAppSelector(selectMarketAsset)

	return (
		<MarketDetail
			mobile={mobile}
			color={getColorFromPriceChange(markPrice?.change)}
			value={
				markPrice ? formatDollars(markPrice.price, { suggestDecimalsForAsset: asset }) : NO_VALUE
			}
			dataKey={MarketDataKey.marketPrice}
		/>
	)
})

const IndexPriceDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const indexPrice = useAppSelector(selectMarketPriceInfo)
	const asset = useAppSelector(selectMarketAsset)

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.indexPrice}
			value={
				indexPrice ? formatDollars(indexPrice.price, { suggestDecimalsForAsset: asset }) : NO_VALUE
			}
		/>
	)
})

const DailyChangeDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const indexPrice = useAppSelector(selectMarketPriceInfo)
	const indexPriceWei = indexPrice?.price ?? ZERO_WEI
	const pastRates = useAppSelector(selectPreviousDayPrices)
	const marketAsset = useAppSelector(selectMarketAsset)
	const pastPrice = pastRates.find(
		(price) => price.synth === getDisplayAsset(marketAsset)?.toUpperCase()
	)

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.dailyChange}
			value={
				indexPriceWei.gt(0) && pastPrice?.rate
					? formatPercent(indexPriceWei.sub(pastPrice.rate).div(indexPriceWei) ?? ZERO_WEI, {
							maxDecimals: 2,
					  })
					: NO_VALUE
			}
			color={
				pastPrice?.rate
					? indexPriceWei.sub(pastPrice.rate).gt(ZERO_WEI)
						? 'green'
						: indexPriceWei.sub(pastPrice.rate).lt(ZERO_WEI)
						? 'red'
						: ''
					: undefined
			}
		/>
	)
})

const HourlyFundingDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const { t } = useTranslation()
	const marketInfo = useAppSelector(selectMarketInfo)
	const fundingRate = marketInfo?.currentFundingRate ?? ZERO_WEI
	const fundingHours = useAppSelector(selectSelectedInputHours)
	const fundingValue = useMemo(
		() => fundingRate.mul(wei(fundingHours)),
		[fundingRate, fundingHours]
	)

	return (
		<MarketDetail
			dataKey={t('futures.market.info.hourly-funding')}
			value={
				fundingValue
					? formatPercent(fundingValue ?? ZERO_WEI, { suggestDecimals: true, maxDecimals: 6 })
					: NO_VALUE
			}
			color={fundingValue?.gt(ZERO_WEI) ? 'green' : fundingValue?.lt(ZERO_WEI) ? 'red' : undefined}
			mobile={mobile}
			extra={<HoursToggle />}
		/>
	)
})

const MarketSkew: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const marketInfo = useAppSelector(selectMarketInfo)

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.skew}
			value={
				<>
					<MarketDetailValue
						color="green"
						value={formatPercent(marketInfo ? marketInfo?.openInterest.longPct : 0, {
							minDecimals: 0,
						})}
						mobile={mobile}
					/>
					{'/'}
					<MarketDetailValue
						color="red"
						value={formatPercent(marketInfo ? marketInfo?.openInterest.shortPct : 0, {
							minDecimals: 0,
						})}
						mobile={mobile}
					/>
				</>
			}
		/>
	)
})

const OpenInterestDetail: React.FC<OpenInterestDetailProps> = memo(({ mobile, isLong }) => {
	const marketInfo = useAppSelector(selectMarketInfo)
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncateOver: 1e3 })
		: null
	const openInterestType = isLong ? 'longUSD' : 'shortUSD'
	const formattedUSD = marketInfo?.openInterest[openInterestType]
		? formatDollars(marketInfo?.openInterest[openInterestType], { truncateOver: 1e3 })
		: NO_VALUE

	const mobileValue = (
		<FlexDivCol>
			<div>{formattedUSD}</div>
			<Body mono size="small" color="secondary" weight="bold">
				{oiCap}
			</Body>
		</FlexDivCol>
	)

	const desktopValue = `${formattedUSD}/${oiCap}`

	const dataKey = `openInterest${isLong ? 'Long' : 'Short'}${
		mobile ? 'Mobile' : ''
	}` as keyof typeof MarketDataKey

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey[dataKey]}
			value={mobile ? mobileValue : desktopValue}
		/>
	)
})

const MainContainer = styled.div<{ mobile?: boolean }>`
	display: grid;
	align-items: center;
	height: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px;
	overflow-y: visible;
	grid-template-columns: 1fr 280px;
	border-bottom: ${(props) => (props.mobile ? 0 : props.theme.colors.selectedTheme.border)};

	${(props) =>
		props.mobile &&
		css`
			display: flex;
			flex-direction: column;
			height: auto;
			height: ${MARKETS_DETAILS_HEIGHT_DESKTOP * 2}px;
		`}
`

export const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	flex: 1;
	gap: 20px;
	padding: 10px 45px 10px 15px;
	overflow-x: scroll;
	scrollbar-width: none;
	display: flex;
	align-items: center;
	width: 100%;
	overflow-y: visible;

	& > div {
		margin-right: 30px;
	}

	${media.lessThan('xl')`
		gap: 10px;
		& > div {
			margin-right: 10px;
		}
	`}

	${media.lessThan('lg')`
		gap: 6px;
	`}

	.heading, .value {
		white-space: nowrap;
	}

	${(props) => css`
		.heading {
			color: ${props.theme.colors.selectedTheme.text.label};
		}

		.value {
			color: ${props.theme.colors.selectedTheme.text.value};
		}

		.green {
			color: ${props.theme.colors.selectedTheme.green};
		}

		.red {
			color: ${props.theme.colors.selectedTheme.red};
		}

		.paused {
			color: ${props.theme.colors.selectedTheme.gray};
		}

		${props.mobile &&
		css`
			height: auto;
			width: 100%;
			padding: 15px;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: 1fr 1fr;
			grid-gap: 15px 25px;
			justify-items: start;
			align-items: start;
			justify-content: start;
			${media.lessThan('md')`
				margin: 0px;
				& > div {
					margin-right: 30px;
				}
			`}

			border-left: none;
			.heading {
				margin-bottom: 2px;
			}
		`}
	`}
`

const ToggleContainer = styled(FlexDivRowCentered)`
	padding-right: 17.5px;
`

export default MarketDetails

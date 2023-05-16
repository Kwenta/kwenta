import { wei } from '@synthetixio/wei';
import React, { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Checkbox } from 'components/Checkbox';
import { getColorFromPriceInfo } from 'components/ColoredPrice/ColoredPrice';
import { FlexDivCol } from 'components/layout/flex';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { zIndex } from 'constants/ui';
import { setShowTradeHistory } from 'state/futures/reducer';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectMarketPriceInfo,
	selectSelectedInputHours,
	selectShowHistory,
	selectSkewAdjustedPriceInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices } from 'state/prices/selectors';
import media from 'styles/media';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles';
import MarketsDropdown from '../Trade/MarketsDropdown';
import { MARKET_SELECTOR_HEIGHT_MOBILE } from '../Trade/MarketsDropdownSelector';
import HoursToggle from './HoursToggle';
import MarketDetail, { MarketDetailValue } from './MarketDetail';
import { MarketDataKey } from './utils';

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const dispatch = useAppDispatch();
	const showHistory = useAppSelector(selectShowHistory);
	return (
		<MainContainer mobile={mobile}>
			<MarketsDropdown mobile={mobile} />
			{mobile && <Spacer height={MARKET_SELECTOR_HEIGHT_MOBILE} />}
			<MarketDetailsContainer mobile={mobile}>
				<MarketPriceDetail mobile={mobile} />
				<IndexPriceDetail mobile={mobile} />
				<DailyChangeDetail mobile={mobile} />
				<OpenInterestLongDetail mobile={mobile} />
				<OpenInterestShortDetail mobile={mobile} />
				<MarketSkew mobile={mobile} />
				<HourlyFundingDetail mobile={mobile} />
			</MarketDetailsContainer>
			{!mobile && (
				<ShowHistoryContainer>
					<Checkbox
						id="history"
						label="Show History"
						checked={showHistory}
						onChange={() => {
							dispatch(setShowTradeHistory(!showHistory));
						}}
					/>
				</ShowHistoryContainer>
			)}
		</MainContainer>
	);
};

const MarketPriceDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const markPrice = useAppSelector(selectSkewAdjustedPriceInfo);

	return (
		<MarketDetail
			mobile={mobile}
			color={getColorFromPriceInfo(markPrice)}
			value={markPrice ? formatDollars(markPrice.price, { suggestDecimals: true }) : NO_VALUE}
			dataKey={MarketDataKey.marketPrice}
		/>
	);
});

const IndexPriceDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const indexPrice = useAppSelector(selectMarketPriceInfo);

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.indexPrice}
			value={indexPrice ? formatDollars(indexPrice.price, { suggestDecimals: true }) : NO_VALUE}
		/>
	);
});

const DailyChangeDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const indexPrice = useAppSelector(selectMarketPriceInfo);
	const indexPriceWei = indexPrice?.price ?? zeroBN;
	const pastRates = useAppSelector(selectPreviousDayPrices);
	const marketAsset = useAppSelector(selectMarketAsset);
	const pastPrice = pastRates.find((price) => price.synth === getDisplayAsset(marketAsset));

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey.dailyChange}
			value={
				indexPriceWei.gt(0) && pastPrice?.rate
					? formatPercent(indexPriceWei.sub(pastPrice.rate).div(indexPriceWei) ?? zeroBN)
					: NO_VALUE
			}
			color={
				pastPrice?.rate
					? indexPriceWei.sub(pastPrice.rate).gt(zeroBN)
						? 'green'
						: indexPriceWei.sub(pastPrice.rate).lt(zeroBN)
						? 'red'
						: ''
					: undefined
			}
		/>
	);
});

const HourlyFundingDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const { t } = useTranslation();
	const marketInfo = useAppSelector(selectMarketInfo);
	const fundingRate = marketInfo?.currentFundingRate ?? zeroBN;
	const fundingHours = useAppSelector(selectSelectedInputHours);
	const targetContainer = document.getElementById('mobile-view') as any;
	const fundingValue = useMemo(() => fundingRate.mul(wei(fundingHours)), [
		fundingRate,
		fundingHours,
	]);

	return (
		<MarketDetail
			dataKey={t('futures.market.info.hourly-funding')}
			value={fundingValue ? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 }) : NO_VALUE}
			color={fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined}
			mobile={mobile}
			extra={
				mobile ? targetContainer && createPortal(<HoursToggle />, targetContainer) : <HoursToggle />
			}
		/>
	);
});

const MarketSkew: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const marketInfo = useAppSelector(selectMarketInfo);

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
	);
});

const OpenInterestLongDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncate: true })
		: null;

	return mobile ? (
		<MarketDetail
			mobile
			dataKey={MarketDataKey.openInterestLongMobile}
			value={
				marketInfo?.openInterest.longUSD ? (
					<FlexDivCol>
						<div>{formatDollars(marketInfo?.openInterest.longUSD, { truncate: true })}</div>
						<div>{oiCap}</div>
					</FlexDivCol>
				) : (
					NO_VALUE
				)
			}
		/>
	) : (
		<MarketDetail
			dataKey={MarketDataKey.openInterestLong}
			value={
				marketInfo?.openInterest.longUSD
					? `${formatDollars(marketInfo?.openInterest.longUSD, { truncate: true })}/${oiCap}`
					: NO_VALUE
			}
		/>
	);
});

const OpenInterestShortDetail: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncate: true })
		: null;

	return mobile ? (
		<MarketDetail
			mobile
			dataKey={MarketDataKey.openInterestShortMobile}
			value={
				marketInfo?.openInterest.shortUSD ? (
					<FlexDivCol>
						<div>{formatDollars(marketInfo?.openInterest.shortUSD, { truncate: true })}</div>
						<div>{oiCap}</div>
					</FlexDivCol>
				) : (
					NO_VALUE
				)
			}
		/>
	) : (
		<MarketDetail
			dataKey={MarketDataKey.openInterestShort}
			value={
				marketInfo?.openInterest.shortUSD
					? `${formatDollars(marketInfo?.openInterest.shortUSD, { truncate: true })}/${oiCap}`
					: NO_VALUE
			}
		/>
	);
});

const MainContainer = styled.div<{ mobile?: boolean }>`
	display: flex;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	align-items: center;
	height: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px;
	overflow-y: visible;

	${(props) =>
		props.mobile &&
		css`
			flex-direction: column;
			height: initial;
			border-top: none;
		`}
`;

export const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	flex: 1;
	gap: 26px;
	padding: 10px 45px 10px 15px;
	box-sizing: border-box;
	overflow-x: scroll;
	scrollbar-width: none;

	display: flex;
	align-items: center;

	box-sizing: border-box;

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
			padding: 15px;
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			${media.lessThan('md')`
				gap: 25px;
			`}
			width: 100%;
			border-left: none;
			.heading {
				margin-bottom: 2px;
			}
		`}
	`}
`;

const ShowHistoryContainer = styled.div`
	display: flex;
	z-index: ${zIndex.HEADER};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	min-height: 50px;
	padding-right: 20px;
`;

export default MarketDetails;

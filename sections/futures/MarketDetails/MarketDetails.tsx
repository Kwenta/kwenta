import { wei } from '@synthetixio/wei';
import React, { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Checkbox } from 'components/Checkbox';
import { getColorFromPriceInfo } from 'components/ColoredPrice/ColoredPrice';
import { FlexDivCol, FlexDivRow } from 'components/layout/flex';
import { Body } from 'components/Text';
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
import { formatDollars, formatPercent, zeroBN } from 'sdk/utils/number';
import { getDisplayAsset } from 'utils/futures';

import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles';
import MarketsDropdown from '../Trade/MarketsDropdown';
import ChartToggle from './ChartToggle';
import HoursToggle from './HoursToggle';
import MarketDetail, { MarketDetailValue } from './MarketDetail';
import { MarketDataKey } from './utils';

type MarketDetailsProps = {
	mobile?: boolean;
};

interface OpenInterestDetailProps extends MarketDetailsProps {
	isLong?: boolean;
}

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const dispatch = useAppDispatch();
	const showHistory = useAppSelector(selectShowHistory);

	const SelectedMarketDetailsView = mobile ? (
		<MarketDetailsContainer mobile={mobile}>
			<IndexPriceDetail mobile={mobile} />
			<MarketSkew mobile={mobile} />
			<HourlyFundingDetail mobile={mobile} />
			<MarketPriceDetail mobile={mobile} />
			<DailyChangeDetail mobile={mobile} />
			<FlexDivRow columnGap="25px">
				<OpenInterestDetail isLong mobile={mobile} />
				<OpenInterestDetail mobile={mobile} />
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
	);

	return (
		<MainContainer mobile={mobile}>
			<MarketsDropdown mobile={mobile} />
			{SelectedMarketDetailsView}
			{!mobile && (
				<ShowHistoryContainer>
					<ChartToggle />
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

const OpenInterestDetail: React.FC<OpenInterestDetailProps> = memo(({ mobile, isLong }) => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncateOver: 1e3 })
		: null;
	const openInterestType = isLong ? 'longUSD' : 'shortUSD';
	const formattedUSD = marketInfo?.openInterest[openInterestType]
		? formatDollars(marketInfo?.openInterest[openInterestType], { truncateOver: 1e3 })
		: NO_VALUE;

	const mobileValue = (
		<FlexDivCol>
			<div>{formattedUSD}</div>
			<Body mono size="small" color="secondary" weight="bold">
				{oiCap}
			</Body>
		</FlexDivCol>
	);

	const desktopValue = `${formattedUSD}/${oiCap}`;

	const dataKey = `openInterest${isLong ? 'Long' : 'Short'}${
		mobile ? 'Mobile' : ''
	}` as keyof typeof MarketDataKey;

	return (
		<MarketDetail
			mobile={mobile}
			dataKey={MarketDataKey[dataKey]}
			value={mobile ? mobileValue : desktopValue}
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
	overflow-x: scroll;
	scrollbar-width: none;
	display: flex;
	align-items: center;

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
`;

const ShowHistoryContainer = styled.div`
	display: flex;
	align-items: center;
	z-index: ${zIndex.HEADER};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.background};
	min-height: 50px;
	padding-left: 8px;
	padding-right: 20px;
`;

export default MarketDetails;

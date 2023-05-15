import { wei } from '@synthetixio/wei';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Checkbox } from 'components/Checkbox';
import { getColorFromPriceInfo } from 'components/ColoredPrice/ColoredPrice';
import Spacer from 'components/Spacer';
import { NO_VALUE } from 'constants/placeholder';
import { setShowTradeHistory } from 'state/futures/reducer';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectMarketPriceInfo,
	selectSelectedInpuHours,
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
			<DetailsWrapper>
				<MarketDetailsContainer mobile={mobile}>
					{!mobile && <MarketPriceDetail />}
					<IndexPriceDetail mobile={mobile} />
					{!mobile && <DailyChangeDetail />}
					{!mobile && <OpenInterestLongDetail />}
					{!mobile && <OpenInterestShortDetail />}
					<MarketSkew mobile={mobile} />
					<HourlyFundingDetail mobile={mobile} />
				</MarketDetailsContainer>
			</DetailsWrapper>
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

const MarketPriceDetail = memo(() => {
	const markPrice = useAppSelector(selectSkewAdjustedPriceInfo);

	return (
		<MarketDetail
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

const DailyChangeDetail = memo(() => {
	const indexPrice = useAppSelector(selectMarketPriceInfo);
	const indexPriceWei = indexPrice?.price ?? zeroBN;
	const pastRates = useAppSelector(selectPreviousDayPrices);
	const marketAsset = useAppSelector(selectMarketAsset);
	const pastPrice = pastRates.find((price) => price.synth === getDisplayAsset(marketAsset));

	return (
		<MarketDetail
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
	const fundingHours = useAppSelector(selectSelectedInpuHours);

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
			toggle
		/>
	);
});

const OpenInterestLongDetail = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncate: true })
		: null;

	return (
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

const MarketSkew: React.FC<MarketDetailsProps> = memo(({ mobile }) => {
	const marketInfo = useAppSelector(selectMarketInfo);

	return (
		<MarketDetail
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

const OpenInterestShortDetail = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const oiCap = marketInfo?.marketLimitUsd
		? formatDollars(marketInfo?.marketLimitUsd, { truncate: true })
		: null;

	return (
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
		& > div {
			margin-right: 10px;
		}
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
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-gap: 20px 0;
			width: 100%;
			border-left: none;

			.heading {
				margin-bottom: 2px;
			}
		`}
	`}
`;

const DetailsWrapper = styled.div`
	display: block;
	overflow-x: scroll;
	scrollbar-width: none;
`;

const ShowHistoryContainer = styled.div`
	margin: 0 20px;
`;

export default MarketDetails;

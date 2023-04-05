import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getColorFromPriceInfo } from 'components/ColoredPrice/ColoredPrice';
import { NO_VALUE } from 'constants/placeholder';
import {
	selectMarketAsset,
	selectMarketInfo,
	selectMarketPriceInfo,
	selectSkewAdjustedPriceInfo,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreviousDayPrices } from 'state/prices/selectors';
import media from 'styles/media';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import MarketsDropdown from '../Trade/MarketsDropdown';
import MarketDetail, { MarketDetailValue } from './MarketDetail';
import { MarketDataKey } from './utils';

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	return (
		<MainContainer mobile={mobile}>
			<MarketsDropdown mobile />
			<MarketDetailsContainer mobile={mobile}>
				{!mobile && <MarketPriceDetail />}
				<IndexPriceDetail />
				{!mobile && <DailyChangeDetail />}
				<HourlyFundingDetail />
				<OpenInterestLongDetail />
				<OpenInterestShortDetail />
				{!mobile && <MarketSkew />}
			</MarketDetailsContainer>
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

const IndexPriceDetail = memo(() => {
	const indexPrice = useAppSelector(selectMarketPriceInfo);

	return (
		<MarketDetail
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

const HourlyFundingDetail = memo(() => {
	const { t } = useTranslation();
	const marketInfo = useAppSelector(selectMarketInfo);
	const fundingValue = marketInfo?.currentFundingRate;

	return (
		<MarketDetail
			dataKey={t('futures.market.info.hourly-funding')}
			value={fundingValue ? formatPercent(fundingValue ?? zeroBN, { minDecimals: 6 }) : NO_VALUE}
			color={fundingValue?.gt(zeroBN) ? 'green' : fundingValue?.lt(zeroBN) ? 'red' : undefined}
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
					? `${formatDollars(marketInfo?.openInterest.longUSD, { truncate: true })} / ${oiCap}`
					: NO_VALUE
			}
		/>
	);
});

const MarketSkew = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);

	return (
		<MarketDetail
			dataKey={MarketDataKey.skew}
			value={
				<>
					<MarketDetailValue
						color="red"
						value={formatPercent(marketInfo ? marketInfo?.openInterest.shortPct : 0, {
							minDecimals: 0,
						})}
					/>
					{' / '}
					<MarketDetailValue
						color="green"
						value={formatPercent(marketInfo ? marketInfo?.openInterest.longPct : 0, {
							minDecimals: 0,
						})}
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
					? `${formatDollars(marketInfo?.openInterest.shortUSD, { truncate: true })} / ${oiCap}`
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
	height: 67px;

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
	height: 100%;
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
		border-left: ${props.theme.colors.selectedTheme.border};

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
			grid-template-columns: 1fr 1fr;
			grid-gap: 20px 0;
			width: 100%;
			border-left: none;

			.heading {
				margin-bottom: 2px;
			}
		`}
	`}
`;

export default MarketDetails;

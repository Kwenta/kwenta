import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import StyledTooltip from 'components/Tooltip/StyledTooltip';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import { currentMarketState, marketInfoState } from 'store/futures';
import media from 'styles/media';
import { formatDollars, formatPercent } from 'utils/formatters/number';

import useGetMarketData from './useGetMarketData';
import { isMarketDataKey, marketDataKeyMap } from './utils';

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const { t } = useTranslation();

	const marketInfo = useRecoilValue(marketInfoState);
	const marketAsset = useRecoilValue(currentMarketState);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';

	const marketData = useGetMarketData(mobile);

	const lastOracleUpdateTimeQuery = useRateUpdateQuery({
		baseCurrencyKey: marketAsset,
	});

	const lastOracleUpdateTime: Date = useMemo(() => lastOracleUpdateTimeQuery?.data ?? new Date(), [
		lastOracleUpdateTimeQuery,
	]);

	// skew text
	const longText = useMemo(() => {
		return (
			marketInfo?.openInterest &&
			formatDollars(marketInfo.openInterest.longUSD, {
				maxDecimals: 2,
				...(marketInfo?.openInterest?.longUSD.gt(1e6)
					? { truncation: { divisor: 1e6, unit: 'M' } }
					: {}),
			})
		);
	}, [marketInfo]);

	const shortText = useMemo(() => {
		return (
			marketInfo?.openInterest &&
			formatDollars(marketInfo.openInterest.shortUSD, {
				maxDecimals: 2,
				...(marketInfo?.openInterest?.shortUSD.gt(1e6)
					? { truncation: { divisor: 1e6, unit: 'M' } }
					: {}),
			})
		);
	}, [marketInfo]);

	return (
		<MarketDetailsContainer mobile={mobile}>
			{Object.entries(marketData).map(([key, { value, color }]) => {
				const colorClass = color || '';
				const children = (
					<WithCursor cursor="help" key={key}>
						<div key={key}>
							<p className="heading">{key}</p>
							<span className={`value ${colorClass} ${pausedClass}`}>{value}</span>
						</div>
					</WithCursor>
				);

				if (key === marketInfo?.marketName) {
					return (
						<TimerTooltip
							position={'fixed'}
							key={key}
							startTimeDate={lastOracleUpdateTime}
							width={'131px'}
						>
							{children}
						</TimerTooltip>
					);
				}

				if (isMarketDataKey(key)) {
					return (
						<MarketDetailsTooltip
							key={key}
							position={'fixed'}
							height={'auto'}
							mobile={mobile}
							content={t(`exchange.market-details-card.tooltips.${marketDataKeyMap[key]}`)}
						>
							{children}
						</MarketDetailsTooltip>
					);
				}

				return children;
			})}

			{mobile && (
				<div key="Skew">
					<p className="heading">Skew</p>
					<SkewDataContainer>
						<div className={`value green ${pausedClass}`}>
							{marketInfo?.openInterest &&
								formatPercent(marketInfo.openInterest.longPct ?? 0, { minDecimals: 0 })}{' '}
							({longText})
						</div>
						<div className={`value red ${pausedClass}`}>
							{marketInfo?.openInterest &&
								formatPercent(marketInfo.openInterest.shortPct ?? 0, { minDecimals: 0 })}{' '}
							({shortText})
						</div>
					</SkewDataContainer>
				</div>
			)}
		</MarketDetailsContainer>
	);
};

// Extend type of cursor to accept different style of cursor. Currently accept only 'help'
const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const SkewDataContainer = styled.div`
	grid-row: 1;
`;

const MarketDetailsTooltip = styled(StyledTooltip)<{ mobile?: boolean }>`
	z-index: 2;
	padding: 10px;
	right: ${(props) => props.mobile && '1px'};
`;

const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	width: 100%;
	height: 55px;
	padding: 10px 45px 10px 15px;
	margin-bottom: 16px;
	box-sizing: border-box;
	overflow-x: scroll;
	scrollbar-width: none;

	display: flex;
	justify-content: space-between;
	align-items: start;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	${media.lessThan('xl')`
		& > div {
			margin-right: 10px;
		}
	`}

	p,
	span {
		margin: 0;
		text-align: left;
	}

	.heading,
	.value {
		white-space: nowrap;
	}

	.heading {
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.title};
	}

	.value {
		font-family: ${(props) => props.theme.fonts.mono};
		font-size: 13px;
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}

	.green {
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}

	.paused {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	${(props) =>
		props.mobile &&
		css`
			height: auto;
			padding: 15px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-gap: 20px 0;

			.heading {
				margin-bottom: 2px;
			}
		`}
`;

export default MarketDetails;

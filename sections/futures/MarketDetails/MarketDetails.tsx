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

import MarketDetail from './MarketDetail';
import useGetMarketData from './useGetMarketData';

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const marketInfo = useRecoilValue(marketInfoState);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';

	const marketData = useGetMarketData(mobile);

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
			{Object.entries(marketData).map(([key, data]) => (
				<MarketDetail {...data} marketKey={key} mobile={Boolean(mobile)}></MarketDetail>
			))}

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

const SkewDataContainer = styled.div`
	grid-row: 1;
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

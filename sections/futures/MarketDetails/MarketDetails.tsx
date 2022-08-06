import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import StyledTooltip from 'components/Tooltip/StyledTooltip';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import { currentMarketState, marketInfoState } from 'store/futures';
import media from 'styles/media';
import { formatPercent } from 'utils/formatters/number';

import useGetMarketData from './useGetMarketData';
import useGetSkewData from './useGetSkewData';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const { t } = useTranslation();

	const marketInfo = useRecoilValue(marketInfoState);
	const marketAsset = useRecoilValue(currentMarketState);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';

	const skewData = useGetSkewData();
	const data: MarketData = useGetMarketData(mobile);

	const lastOracleUpdateTimeQuery = useRateUpdateQuery({
		baseCurrencyKey: marketAsset,
	});

	const lastOracleUpdateTime: Date = useMemo(() => lastOracleUpdateTimeQuery?.data ?? new Date(), [
		lastOracleUpdateTimeQuery,
	]);

	const enableTooltip = (key: string, children: React.ReactElement) => {
		switch (key) {
			case 'External Price':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.external-price')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Change':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-change')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Volume':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-vol')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case '24H Trades':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.24h-trades')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case 'Open Interest':
				return (
					<MarketDetailsTooltip
						key={key}
						preset="bottom"
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.open-interest')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case marketInfo?.marketName:
				return (
					<TimerTooltip
						key={key}
						preset="bottom"
						startTimeDate={lastOracleUpdateTime}
						width={'131px'}
					>
						{children}
					</TimerTooltip>
				);
			case 'Inst. Funding Rate' || '1H Funding Rate':
				return (
					<OneHrFundingRateTooltip
						key={key}
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.1h-funding-rate')}
					>
						{children}
					</OneHrFundingRateTooltip>
				);
			default:
				return children;
		}
	};

	return (
		<MarketDetailsContainer mobile={mobile}>
			{Object.entries(data).map(([key, { value, color }]) => {
				const colorClass = color || '';

				return enableTooltip(
					key,
					<WithCursor cursor="help">
						<div key={key}>
							<p className="heading">{key}</p>
							<span className={`value ${colorClass} ${pausedClass}`}>{value}</span>
						</div>
					</WithCursor>
				);
			})}

			{mobile && (
				<div key="Skew">
					<p className="heading">Skew</p>
					<SkewDataContainer>
						<div className={`value green ${pausedClass}`}>
							{formatPercent(skewData.data.long, { minDecimals: 0 })} ({skewData.long})
						</div>
						<div className={`value red ${pausedClass}`}>
							{formatPercent(skewData.data.short, { minDecimals: 0 })} ({skewData.short})
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

const OneHrFundingRateTooltip = styled(StyledTooltip)`
	${media.greaterThan('sm')`
		bottom: -115px;
		z-index: 2;
		left: -200px;
		padding: 10px;
	`}
`;

const MarketDetailsTooltip = styled(StyledTooltip)`
	z-index: 2;
	padding: 10px;
`;

const MarketDetailsContainer = styled.div<{ mobile?: boolean }>`
	width: 100%;
	height: 55px;
	padding: 10px 45px 10px 15px;
	margin-bottom: 16px;
	box-sizing: border-box;

	display: flex;
	justify-content: space-between;
	align-items: start;

	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	box-sizing: border-box;

	p,
	span {
		margin: 0;
		text-align: left;
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

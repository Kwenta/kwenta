import { Synths } from '@synthetixio/contracts-interface';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import StyledTooltip from 'components/Tooltip/StyledTooltip';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import { currentMarketState, marketInfoState } from 'store/futures';
import media from 'styles/media';
import { formatCurrency, formatPercent } from 'utils/formatters/number';

import useGetMarketData from './useGetMarketData';

type MarketData = Record<string, { value: string | JSX.Element; color?: string }>;

type MarketDetailsProps = {
	mobile?: boolean;
};

const MarketDetails: React.FC<MarketDetailsProps> = ({ mobile }) => {
	const { t } = useTranslation();

	const marketInfo = useRecoilValue(marketInfoState);
	const marketAsset = useRecoilValue(currentMarketState);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';

	const data: MarketData = useGetMarketData(mobile);

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
			formatCurrency(Synths.sUSD, marketInfo.openInterest.longUSD, {
				sign: '$',
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
			formatCurrency(Synths.sUSD, marketInfo.openInterest.shortUSD, {
				sign: '$',
				maxDecimals: 2,
				...(marketInfo?.openInterest?.shortUSD.gt(1e6)
					? { truncation: { divisor: 1e6, unit: 'M' } }
					: {}),
			})
		);
	}, [marketInfo]);

	const enableTooltip = (key: string, children: React.ReactElement) => {
		switch (key) {
			case 'External Price':
				return (
					<MarketDetailsTooltip
						position={'fixed'}
						key={key}
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
						position={'fixed'}
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
						position={'fixed'}
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
						position={'fixed'}
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
						position={'fixed'}
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.open-interest')}
					>
						{children}
					</MarketDetailsTooltip>
				);
			case marketInfo?.marketName:
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
			case 'Inst. Funding Rate':
			case '1H Funding Rate':
				return (
					<MarketDetailsTooltip
						key={key}
						position={'fixed'}
						height={'auto'}
						content={t('exchange.market-details-card.tooltips.1h-funding-rate')}
					>
						{children}
					</MarketDetailsTooltip>
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
							{marketInfo?.openInterest &&
								formatPercent(marketInfo.openInterest.long ?? 0, { minDecimals: 0 })}{' '}
							({longText})
						</div>
						<div className={`value red ${pausedClass}`}>
							{marketInfo?.openInterest &&
								formatPercent(marketInfo.openInterest.short ?? 0, { minDecimals: 0 })}{' '}
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

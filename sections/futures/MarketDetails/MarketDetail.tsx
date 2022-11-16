import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import StyledTooltip from 'components/Tooltip/StyledTooltip';
import TimerTooltip from 'components/Tooltip/TimerTooltip';
import useRateUpdateQuery from 'queries/rates/useRateUpdateQuery';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { marketInfoState } from 'store/futures';

import { isMarketDataKey, marketDataKeyMap } from './utils';

type MarketDetailProps = {
	mobile: boolean;
	marketKey: string;
	color?: string;
	value: string | ReactElement;
};

const MarketDetail: React.FC<MarketDetailProps> = ({ mobile, marketKey, color, value }) => {
	const { t } = useTranslation();
	const marketInfo = useRecoilValue(marketInfoState);
	const marketAsset = useAppSelector(selectMarketAsset);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';
	const lastOracleUpdateTimeQuery = useRateUpdateQuery({
		baseCurrencyKey: marketAsset,
	});

	const lastOracleUpdateTime: Date = useMemo(() => lastOracleUpdateTimeQuery?.data ?? new Date(), [
		lastOracleUpdateTimeQuery,
	]);
	const children = (
		<WithCursor cursor="help" key={marketKey}>
			<div key={marketKey}>
				<p className="heading">{marketKey}</p>
				<span className={`value ${color || ''} ${pausedClass}`}>{value}</span>
			</div>
		</WithCursor>
	);

	if (marketKey === marketInfo?.marketName) {
		return (
			<TimerTooltip
				position={'fixed'}
				key={marketKey}
				startTimeDate={lastOracleUpdateTime}
				width={'131px'}
			>
				{children}
			</TimerTooltip>
		);
	}

	if (isMarketDataKey(marketKey)) {
		return (
			<MarketDetailsTooltip
				key={marketKey}
				position={'fixed'}
				height={'auto'}
				mobile={mobile}
				content={t(`exchange.market-details-card.tooltips.${marketDataKeyMap[marketKey]}`)}
			>
				{children}
			</MarketDetailsTooltip>
		);
	}

	return children;
};

export default MarketDetail;

// Extend type of cursor to accept different style of cursor. Currently accept only 'help'
const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const MarketDetailsTooltip = styled(StyledTooltip)<{ mobile?: boolean }>`
	z-index: 2;
	padding: 10px;
	right: ${(props) => props.mobile && '1px'};
`;

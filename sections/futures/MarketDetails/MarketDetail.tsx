import { ReactElement, memo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Tooltip from 'components/Tooltip/Tooltip';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import { isMarketDataKey, marketDataKeyMap } from './utils';

type MarketDetailProps = {
	mobile?: boolean;
	marketKey: string;
	color?: string;
	value: string | ReactElement;
};

const MarketDetail: FC<MarketDetailProps> = memo(({ mobile, marketKey, color, value }) => {
	const { t } = useTranslation();
	const marketInfo = useAppSelector(selectMarketInfo);

	const pausedClass = marketInfo?.isSuspended ? 'paused' : '';
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
			<MarketDetailsTooltip
				key={marketKey}
				mobile={mobile}
				content={t(`exchange.market-details-card.tooltips.market-key`)}
			>
				{children}
			</MarketDetailsTooltip>
		);
	}

	if (isMarketDataKey(marketKey)) {
		return (
			<MarketDetailsTooltip
				key={marketKey}
				mobile={mobile}
				content={t(`exchange.market-details-card.tooltips.${marketDataKeyMap[marketKey]}`)}
			>
				{children}
			</MarketDetailsTooltip>
		);
	}

	return children;
});

export default MarketDetail;

// Extend type of cursor to accept different style of cursor. Currently accept only 'help'
const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`;

const MarketDetailsTooltip = styled(Tooltip).attrs({ position: 'fixed', height: 'auto' })<{
	mobile?: boolean;
}>`
	z-index: 2;
	padding: 10px;
	right: ${(props) => props.mobile && '1px'};
`;

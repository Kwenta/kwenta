import React, { FC } from 'react';

import CircuitBreakerIcon from 'assets/svg/app/market-closure/circuit-breaker.svg';
import EmergencyShutdownIcon from 'assets/svg/app/market-closure/emergency-shutdown.svg';
import FrozenIcon from 'assets/svg/app/market-closure/frozen.svg';
import MarketPauseIcon from 'assets/svg/app/market-closure/market-pause.svg';
import { MarketClosureReason } from 'hooks/useMarketClosed';

type MarketClosureIconProps = {
	marketClosureReason: MarketClosureReason;
	size?: 'sm' | 'lg';
};

export const MarketClosureIcon: FC<MarketClosureIconProps> = ({
	marketClosureReason,
	size = 'lg',
}) => {
	const sharedProps = {
		width: size === 'sm' ? 16 : 32,
		height: size === 'sm' ? 16 : 32,
		className: 'market-closure-icon',
	};

	const defaultIcon = <MarketPauseIcon {...sharedProps} />;

	switch (marketClosureReason) {
		case 'frozen':
			return <FrozenIcon {...sharedProps} />;
		case 'market-closure':
			return defaultIcon;
		case 'circuit-breaker':
			return <CircuitBreakerIcon {...sharedProps} />;
		case 'emergency':
			return <EmergencyShutdownIcon {...sharedProps} />;
		default:
			return defaultIcon;
	}
};

export default MarketClosureIcon;

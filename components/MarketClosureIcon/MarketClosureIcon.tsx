import React, { FC } from 'react';
import FrozenIcon from 'assets/svg/app/market-closure/frozen.svg';
import MarketPauseIcon from 'assets/svg/app/market-closure/market-pause.svg';
// import LimitResetIcon from 'assets/svg/app/market-closure/limit-reset.svg';
import CircuitBreakerIcon from 'assets/svg/app/market-closure/circuit-breaker.svg';
import EmergencyShutdownIcon from 'assets/svg/app/market-closure/emergency-shutdown.svg';

import { MarketClosureReason } from 'hooks/useMarketClosed';

const Icon = ({ className, X, ...props }: any) => {
	return <X className={className} {...props} />;
};

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
		// className: 'market-closure-icon',
	};

	const defaultIcon = <Icon className="market-closure-icon" X={MarketPauseIcon} {...sharedProps} />;

	switch (marketClosureReason) {
		case 'frozen':
			return <Icon className="market-closure-icon" X={FrozenIcon} {...sharedProps} />;
		case 'market-closure':
			return defaultIcon;
		case 'circuit-breaker':
			return <Icon className="market-closure-icon" X={CircuitBreakerIcon} {...sharedProps} />;
		case 'emergency':
			return <Icon className="market-closure-icon" X={EmergencyShutdownIcon} {...sharedProps} />;
		default:
			return defaultIcon;
	}
};

export default MarketClosureIcon;

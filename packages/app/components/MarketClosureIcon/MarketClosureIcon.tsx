import { MarketClosureReason } from '@kwenta/sdk/types';
import { FC, memo } from 'react';

import CircuitBreakerIcon from 'assets/svg/app/market-closure/circuit-breaker.svg';
import EmergencyShutdownIcon from 'assets/svg/app/market-closure/emergency-shutdown.svg';
import FrozenIcon from 'assets/svg/app/market-closure/frozen.svg';
import MarketPauseIcon from 'assets/svg/app/market-closure/market-pause.svg';

type MarketClosureIconProps = {
	marketClosureReason: MarketClosureReason | 'frozen';
	size?: 'sm' | 'lg';
};

export const MarketClosureIcon: FC<MarketClosureIconProps> = memo(
	({ marketClosureReason, size = 'lg' }) => {
		const sharedProps = {
			width: size === 'sm' ? 16 : 32,
			height: size === 'sm' ? 16 : 32,
			className: 'market-closure-icon',
		};

		switch (marketClosureReason) {
			case 'frozen':
				return <FrozenIcon {...sharedProps} />;
			case 'circuit-breaker':
				return <CircuitBreakerIcon {...sharedProps} />;
			case 'emergency':
				return <EmergencyShutdownIcon {...sharedProps} />;
			case 'market-closure':
			default:
				return <MarketPauseIcon {...sharedProps} />;
		}
	}
);

export default MarketClosureIcon;

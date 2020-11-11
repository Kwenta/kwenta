import React, { FC } from 'react';
import { Svg } from 'react-optimized-image';

import FrozenIcon from 'assets/svg/app/market-closure/frozen.svg';
import MarketPauseIcon from 'assets/svg/app/market-closure/market-pause.svg';
// import LimitResetIcon from 'assets/svg/app/market-closure/limit-reset.svg';
import CircuitBreakerIcon from 'assets/svg/app/market-closure/circuit-breaker.svg';
import EmergencyShutdownIcon from 'assets/svg/app/market-closure/emergency-shutdown.svg';

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

	const defaultIcon = (
		<Svg
			{...sharedProps}
			src={MarketPauseIcon}
			viewBox={`0 0 ${MarketPauseIcon.width} ${MarketPauseIcon.height}`}
		/>
	);

	switch (marketClosureReason) {
		case 'frozen':
			return (
				<Svg
					{...sharedProps}
					src={FrozenIcon}
					viewBox={`0 0 ${FrozenIcon.width} ${FrozenIcon.height}`}
				/>
			);
		case 'market-closure':
			return defaultIcon;
		case 'circuit-breaker':
			return (
				<Svg
					{...sharedProps}
					src={CircuitBreakerIcon}
					viewBox={`0 0 ${CircuitBreakerIcon.width} ${CircuitBreakerIcon.height}`}
				/>
			);
		case 'emergency':
			return (
				<Svg
					{...sharedProps}
					src={EmergencyShutdownIcon}
					viewBox={`0 0 ${EmergencyShutdownIcon.width} ${EmergencyShutdownIcon.height}`}
				/>
			);
		default:
			return defaultIcon;
	}
};

export default MarketClosureIcon;

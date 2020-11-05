import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import FrozenIcon from 'assets/svg/app/market-closure/frozen.svg';
import MarketPauseIcon from 'assets/svg/app/market-closure/market-pause.svg';
// import LimitResetIcon from 'assets/svg/app/market-closure/limit-reset.svg';
import CircuitBreakerIcon from 'assets/svg/app/market-closure/circuit-breaker.svg';
import EmergencyShutdownIcon from 'assets/svg/app/market-closure/emergency-shutdown.svg';

import { MarketClosureReason } from 'hooks/useMarketClosed';

import { CurrencyKey } from 'constants/currency';

import CurrencyIcon from '../CurrencyIcon';

import { ContainerRowMixin } from '../common';

type CurrencyNameProps = {
	currencyKey: CurrencyKey;
	symbol?: string;
	name?: string | null;
	showIcon?: boolean;
	iconProps?: object;
	marketClosureReason?: MarketClosureReason;
};

const getMarketClosureIcon = (marketClosureReason: MarketClosureReason) => {
	const sharedProps = {
		width: 16,
		height: 16,
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
		case 1:
			return defaultIcon;
		case 55:
		case 65:
			return (
				<Svg
					{...sharedProps}
					src={CircuitBreakerIcon}
					viewBox={`0 0 ${CircuitBreakerIcon.width} ${CircuitBreakerIcon.height}`}
				/>
			);
		// Emergency
		case 99999:
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

export const CurrencyName: FC<CurrencyNameProps> = ({
	currencyKey,
	symbol,
	name = null,
	showIcon = false,
	iconProps = {},
	marketClosureReason,
	...rest
}) => (
	<Container showIcon={showIcon} {...rest}>
		{showIcon && (
			<CurrencyIconContainer>
				<CurrencyIcon className="icon" currencyKey={currencyKey} {...iconProps} />
				{marketClosureReason ? (
					<MarketClosureIconContainer>
						{getMarketClosureIcon(marketClosureReason)}
					</MarketClosureIconContainer>
				) : null}
			</CurrencyIconContainer>
		)}
		<NameAndSymbol>
			<Symbol className="symbol">{symbol || currencyKey}</Symbol>
			{name && <Name className="name">{name}</Name>}
		</NameAndSymbol>
	</Container>
);

const Container = styled.span<{ showIcon?: boolean }>`
	${(props) =>
		props.showIcon &&
		css`
			position: relative;
			display: inline-grid;
			align-items: center;
			grid-auto-flow: column;
			grid-gap: 8px;
		`}
`;

const NameAndSymbol = styled.span`
	${ContainerRowMixin};
`;

const Symbol = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
`;

const Name = styled.span`
	color: ${(props) => props.theme.colors.blueberry};
`;

const CurrencyIconContainer = styled.span`
	position: relative;
`;

const MarketClosureIconContainer = styled.span`
	position: absolute;
	bottom: 0;
	right: 0;
	transform: translate(10%, 10%);
`;

export default CurrencyName;

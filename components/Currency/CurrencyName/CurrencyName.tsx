import React, { FC } from 'react';
import styled, { css } from 'styled-components';

import { MarketClosureReason } from 'hooks/useMarketClosed';

import { CurrencyKey } from 'constants/currency';

import MarketClosureIcon from 'components/MarketClosureIcon';

import CurrencyIcon from '../CurrencyIcon';

import { CurrencyIconProps } from '../CurrencyIcon/CurrencyIcon';

import { ContainerRowMixin } from '../common';

type CurrencyNameProps = {
	currencyKey: CurrencyKey;
	symbol?: string;
	name?: string | null;
	showIcon?: boolean;
	iconProps?: Partial<CurrencyIconProps>;
	marketClosureReason?: MarketClosureReason;
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
				{marketClosureReason != null ? (
					<MarketClosureIconContainer>
						<MarketClosureIcon marketClosureReason={marketClosureReason} size="sm" />
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

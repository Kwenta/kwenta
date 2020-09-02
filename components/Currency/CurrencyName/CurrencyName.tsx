import React, { FC } from 'react';
import styled, { css } from 'styled-components';

import CurrencyIcon from '../CurrencyIcon';

import { CurrencyKey } from 'constants/currency';

import { ContainerRowMixin } from '../common';

type CurrencyNameProps = {
	currencyKey: CurrencyKey;
	symbol?: string;
	name?: string | null;
	showIcon?: boolean;
	iconProps?: object;
};

export const CurrencyName: FC<CurrencyNameProps> = ({
	currencyKey,
	symbol,
	name = null,
	showIcon = false,
	iconProps = {},
	...rest
}) => (
	<Container showIcon={showIcon} {...rest}>
		{showIcon && <CurrencyIcon className="icon" currencyKey={currencyKey} {...iconProps} />}
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

export default CurrencyName;

import React, { FC } from 'react';
import styled from 'styled-components';

import { formatFiatCurrency, formatNumber } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';

type CurrencyAmountProps = {
	amount: number;
	totalValue: number;
	sign?: string;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({ amount, totalValue, sign, ...rest }) => (
	<Container {...rest}>
		<TotalValue className="total-value">{formatFiatCurrency(totalValue, { sign })}</TotalValue>
		<Amount className="amount">{formatNumber(amount)}</Amount>
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
	justify-items: end;
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Amount = styled.span``;
const TotalValue = styled.span`
	color: ${(props) => props.theme.colors.white};
`;

export default CurrencyAmount;

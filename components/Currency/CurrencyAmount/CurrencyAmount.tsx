import React, { FC } from 'react';
import styled from 'styled-components';

import { ContainerRowMixin } from '../common';

type CurrencyAmountProps = {
	amount: number;
	totalValue: string;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({ amount, totalValue, ...rest }) => (
	<Container {...rest}>
		<Amount className="amount">{amount}</Amount>
		<TotalValue className="total-value">{totalValue}</TotalValue>
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
`;

const Amount = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
`;
const TotalValue = styled.span``;

export default CurrencyAmount;

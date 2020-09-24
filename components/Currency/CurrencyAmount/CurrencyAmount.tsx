import React, { FC } from 'react';
import styled from 'styled-components';

import { formatCurrency, formatNumber } from 'utils/formatters/number';

import { CurrencyKey } from 'constants/currency';

import { ContainerRowMixin } from '../common';

type CurrencyAmountProps = {
	currencyKey: CurrencyKey;
	amount: number;
	totalValue: number;
	sign?: string;
	conversionRate?: number | null;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({
	currencyKey,
	amount,
	totalValue,
	sign,
	conversionRate,
	...rest
}) => (
	<Container {...rest}>
		<TotalValue className="total-value">
			{formatCurrency(
				currencyKey,
				conversionRate != null ? totalValue / conversionRate : totalValue,
				{ sign }
			)}
		</TotalValue>
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

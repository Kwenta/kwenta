import React, { FC } from 'react';
import styled from 'styled-components';

import { formatCurrency, FormatCurrencyOptions, formatNumber } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';
import { wei, WeiSource } from '@synthetixio/wei';

type CurrencyAmountProps = {
	currencyKey: string;
	amount: WeiSource;
	totalValue: WeiSource;
	sign?: string;
	conversionRate?: WeiSource | null;
	formatAmountOptions?: FormatCurrencyOptions;
	formatTotalValueOptions?: FormatCurrencyOptions;
};

export const CurrencyAmount: FC<CurrencyAmountProps> = ({
	currencyKey,
	amount,
	totalValue,
	sign,
	conversionRate,
	formatAmountOptions = {},
	formatTotalValueOptions = {},
	...rest
}) => (
	<Container {...rest}>
		<Amount className="amount">{formatNumber(amount, formatAmountOptions)}</Amount>
		<TotalValue className="total-value">
			{formatCurrency(
				currencyKey,
				conversionRate != null ? wei(totalValue).div(conversionRate) : totalValue,
				{ sign }
			)}
		</TotalValue>
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
	justify-items: end;
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
`;
const TotalValue = styled.span``;

export default CurrencyAmount;

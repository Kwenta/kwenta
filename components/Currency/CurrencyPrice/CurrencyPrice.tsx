import React, { FC } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';

import { ContainerRowMixin } from '../common';
import { formatFiatCurrency } from 'utils/formatters/number';

type CurrencyPriceProps = {
	price: number;
	sign?: string;
	change?: number;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = ({ price, sign, change, ...rest }) => (
	<Container {...rest}>
		<Price className="price">{formatFiatCurrency(price, { sign })}</Price>
		{change != null && <ChangePercent className="percent" value={change} />}
	</Container>
);

const Container = styled.span`
	${ContainerRowMixin};
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
`;

const Price = styled.span``;

export default CurrencyPrice;

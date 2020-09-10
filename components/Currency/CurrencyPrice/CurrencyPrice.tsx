import React, { FC } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';

import { CurrencyKey } from 'constants/currency';

import { formatCurrency } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';
import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import { Period } from 'constants/period';

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	price: number;
	sign?: string;
	showChange?: boolean;
	period?: Period;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = ({
	currencyKey,
	price,
	sign,
	showChange,
	period = Period.ONE_DAY,
	...rest
}) => {
	const historicalRates = useHistoricalRatesQuery(currencyKey, period);
	const change = historicalRates.data?.change ?? null;
	return (
		<Container {...rest}>
			<Price className="price">{formatCurrency(currencyKey, price, { sign })}</Price>
			{change != null && showChange && <ChangePercent className="percent" value={change} />}
		</Container>
	);
};

const Container = styled.span`
	${ContainerRowMixin};
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
`;

const Price = styled.span``;

export default CurrencyPrice;

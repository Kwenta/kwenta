import React, { FC } from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';

import ChangePercent from 'components/ChangePercent';

import { CurrencyKey } from 'constants/currency';

import { formatCurrency, FormatCurrencyOptions } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';
import { ethers } from 'ethers';

type WeiSource = Wei | number | string | ethers.BigNumber;

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	showCurrencyKey?: boolean;
	price: WeiSource;
	sign?: string;
	change?: number;
	conversionRate?: WeiSource | null;
	formatOptions?: FormatCurrencyOptions;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = ({
	currencyKey,
	price,
	sign,
	change,
	conversionRate,
	showCurrencyKey,
	formatOptions,
	...rest
}) => {
	return (
		<Container {...rest}>
			<Price className="price">
				{formatCurrency(
					currencyKey,
					conversionRate && wei(conversionRate).gt(0) ? wei(price).div(conversionRate) : price,
					{
						sign,
						currencyKey: showCurrencyKey != null ? currencyKey : undefined,
						...formatOptions,
					}
				)}
			</Price>
			{change != null && <ChangePercent className="percent" value={change} />}
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

import { wei, WeiSource } from '@synthetixio/wei';
import React, { FC, memo } from 'react';
import styled, { css } from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import { ContainerRowMixin } from 'components/layout/grid';
import { CurrencyKey } from 'constants/currency';
import { formatCurrency, FormatCurrencyOptions } from 'utils/formatters/number';

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	showCurrencyKey?: boolean;
	price: WeiSource;
	sign?: string;
	change?: number;
	conversionRate?: WeiSource;
	formatOptions?: FormatCurrencyOptions;
	truncate?: boolean;
	side?: 'positive' | 'negative';
};

export const CurrencyPrice: FC<CurrencyPriceProps> = memo(
	({
		currencyKey,
		price,
		sign,
		change,
		conversionRate,
		showCurrencyKey,
		formatOptions,
		side,
		truncate = false,
		...rest
	}) => {
		const cleanPrice = wei(price);
		const cleanConversionRate = wei(conversionRate ?? 0);

		if (truncate) {
			formatOptions = { ...formatOptions, truncate: true };
		}

		return (
			<Container $side={side} {...rest}>
				<span className="price">
					{formatCurrency(
						currencyKey,
						cleanConversionRate.gt(0) ? cleanPrice.div(cleanConversionRate) : cleanPrice,
						{
							sign,
							currencyKey: showCurrencyKey ? currencyKey : undefined,
							...formatOptions,
						}
					)}
				</span>
				{!!change && <ChangePercent className="percent" value={change} />}
			</Container>
		);
	}
);

const Container = styled.span<{ $side?: 'positive' | 'negative' }>`
	${ContainerRowMixin};
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	${(props) =>
		!!props.$side &&
		css`
			color: ${props.theme.colors.selectedTheme.newTheme.text.number[props.$side]};
		`}
`;

export default CurrencyPrice;

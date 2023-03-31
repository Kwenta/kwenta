import { wei, WeiSource } from '@synthetixio/wei';
import React, { FC, memo } from 'react';
import styled, { css } from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import { ContainerRowMixin } from 'components/layout/grid';
import { NumericValue } from 'components/Text';
import { CurrencyKey } from 'constants/currency';
import { formatCurrency, FormatCurrencyOptions } from 'utils/formatters/number';

type CurrencyPriceProps = {
	currencyKey?: CurrencyKey;
	showCurrencyKey?: boolean;
	price: WeiSource;
	sign?: string;
	change?: number;
	conversionRate?: WeiSource;
	formatOptions?: FormatCurrencyOptions;
	truncate?: boolean;
	side?: 'positive' | 'negative' | 'preview';
	colored?: boolean;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = memo(
	({
		price,
		change,
		formatOptions,
		side,
		sign,
		currencyKey = 'sUSD',
		conversionRate = 1,
		showCurrencyKey = false,
		truncate = false,
		colored = false,
		...rest
	}) => {
		const cleanPrice = wei(price);

		return (
			<Container {...rest}>
				<NumericValue
					value={cleanPrice.div(conversionRate)}
					as="span"
					colored={colored}
					colorOverride={side}
				>
					{formatCurrency(currencyKey, cleanPrice.div(conversionRate), {
						sign: currencyKey === 'sUSD' ? '$' : sign,
						currencyKey: showCurrencyKey ? currencyKey : undefined,
						truncate,
						...formatOptions,
					})}
				</NumericValue>
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

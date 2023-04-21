import { wei, WeiSource } from '@synthetixio/wei';
import React, { FC, memo } from 'react';
import styled from 'styled-components';

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
	colorType?: 'secondary' | 'positive' | 'negative' | 'preview';
	colored?: boolean;
};

export const CurrencyPrice: FC<CurrencyPriceProps> = memo(
	({
		price,
		change,
		formatOptions,
		colorType: side,
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
					color={side}
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

const Container = styled.span`
	${ContainerRowMixin};
`;

export default CurrencyPrice;

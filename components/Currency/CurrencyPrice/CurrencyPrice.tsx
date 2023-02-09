import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import React, { FC, memo } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import { ContainerRowMixin } from 'components/layout/grid';
import { CurrencyKey } from 'constants/currency';
import { formatCurrency, FormatCurrencyOptions } from 'utils/formatters/number';

type WeiSource = Wei | number | string | ethers.BigNumber;

type CurrencyPriceProps = {
	currencyKey: CurrencyKey;
	showCurrencyKey?: boolean;
	price: WeiSource;
	sign?: string;
	change?: number;
	conversionRate?: WeiSource | null;
	formatOptions?: FormatCurrencyOptions;
	truncate?: boolean;
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
		truncate = false,
		...rest
	}) => {
		const cleanPrice = wei(price);
		const cleanConversionRate = wei(conversionRate ?? 0);

		if (truncate) {
			formatOptions = { ...formatOptions, truncate: true };
		}

		return (
			<Container {...rest}>
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

const Container = styled.span`
	${ContainerRowMixin};
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

export default CurrencyPrice;

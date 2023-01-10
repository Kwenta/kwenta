import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import React, { FC, memo, useMemo } from 'react';
import styled from 'styled-components';

import ChangePercent from 'components/ChangePercent';
import { CurrencyKey } from 'constants/currency';
import { formatCurrency, FormatCurrencyOptions } from 'utils/formatters/number';

import { ContainerRowMixin } from '../common';

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
		const cleanPrice = useMemo(() => {
			try {
				return wei(price);
			} catch {
				return '';
			}
		}, [price]);

		const cleanConversionRate = useMemo(() => {
			try {
				return wei(conversionRate);
			} catch {
				return '';
			}
		}, [conversionRate]);

		if (truncate && price > 1e6) {
			formatOptions = { ...formatOptions, truncation: { divisor: 1e6, unit: 'M' } };
		}
		return (
			<Container {...rest}>
				<span className="price">
					{formatCurrency(
						currencyKey,
						cleanConversionRate && cleanPrice && cleanConversionRate.gt(0)
							? cleanPrice.div(cleanConversionRate)
							: cleanPrice,
						{
							sign,
							currencyKey: showCurrencyKey != null ? currencyKey : undefined,
							...formatOptions,
						}
					)}
				</span>
				{change != null && <ChangePercent className="percent" value={change} />}
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

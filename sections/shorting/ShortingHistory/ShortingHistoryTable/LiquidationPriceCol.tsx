import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency } from 'utils/formatters/number';

import { MIN_COLLATERAL_RATIO } from 'sections/shorting/constants';

import { StyledCurrencyKey, StyledPrice } from './common';

type LiquidationPriceColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const LiquidationPriceCol: FC<LiquidationPriceColType> = ({ cellProps }) => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const exchangeRates = useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const {
		collateralLockedAmount,
		synthBorrowedAmount,
		collateralLocked,
		synthBorrowed,
	} = cellProps.row.original;

	const collateralLockedPrice = getExchangeRatesForCurrencies(
		exchangeRates,
		collateralLocked,
		selectedPriceCurrency.name
	);

	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortContractInfo = collateralShortContractInfoQuery.isSuccess
		? collateralShortContractInfoQuery?.data ?? null
		: null;

	const minCollateralRatio = useMemo(
		() => collateralShortContractInfo?.minCollateralRatio ?? MIN_COLLATERAL_RATIO,
		[collateralShortContractInfo?.minCollateralRatio]
	);

	const liquidationPrice = useMemo(
		() =>
			collateralLockedAmount
				.multipliedBy(collateralLockedPrice)
				.dividedBy(synthBorrowedAmount.multipliedBy(minCollateralRatio)),
		[collateralLockedAmount, collateralLockedPrice, synthBorrowedAmount, minCollateralRatio]
	);

	return (
		<span>
			<StyledPrice>
				{formatCurrency(
					collateralLocked,
					selectPriceCurrencyRate != null
						? liquidationPrice.dividedBy(selectPriceCurrencyRate)
						: liquidationPrice,
					{
						sign: selectedPriceCurrency.sign,
					}
				)}
			</StyledPrice>
			<StyledCurrencyKey>{synthBorrowed}</StyledCurrencyKey>
		</span>
	);
};

export default LiquidationPriceCol;

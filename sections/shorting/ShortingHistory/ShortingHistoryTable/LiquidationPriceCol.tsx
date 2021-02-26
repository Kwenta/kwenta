import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { StyledCurrencyKey, StyledPrice } from './common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency } from 'utils/formatters/number';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

type LiquidationPriceColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const LiquidationPriceCol: FC<LiquidationPriceColType> = ({ cellProps }) => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

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

	const minCratio = collateralShortContractInfo?.minCollateralRatio;

	return (
		<span>
			<StyledPrice>
				{formatCurrency(
					collateralLocked,
					collateralLockedAmount
						.multipliedBy(collateralLockedPrice)
						.dividedBy(synthBorrowedAmount.multipliedBy(minCratio ? minCratio.toNumber() : 0)),
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

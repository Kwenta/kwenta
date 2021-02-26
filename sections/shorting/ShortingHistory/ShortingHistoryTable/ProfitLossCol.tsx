import { NO_VALUE } from 'constants/placeholder';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';
import React, { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import { formatCurrency } from 'utils/formatters/number';
import { PriceChangeText } from './common';

type ProfitLossColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const ProfitLossCol: FC<ProfitLossColType> = ({ cellProps }) => {
	const collateralShortPositionQuery = useCollateralShortPositionQuery(cellProps.row.original.id);
	const collateralShortPosition = useMemo(
		() => (collateralShortPositionQuery.isSuccess ? collateralShortPositionQuery.data : null),
		[collateralShortPositionQuery]
	);

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const isPositivePnL = useMemo(
		() =>
			collateralShortPosition?.profitLoss != null ? collateralShortPosition.profitLoss.gt(0) : null,
		[collateralShortPosition?.profitLoss]
	);

	return (
		<>
			{collateralShortPosition?.profitLoss != null ? (
				<PriceChangeText isPositive={!!isPositivePnL}>
					{isPositivePnL ? '+' : '-'}
					{formatCurrency(selectedPriceCurrency.name, collateralShortPosition.profitLoss, {
						sign: selectedPriceCurrency.sign,
					})}
				</PriceChangeText>
			) : (
				<span>{NO_VALUE}</span>
			)}
		</>
	);
};

export default ProfitLossCol;

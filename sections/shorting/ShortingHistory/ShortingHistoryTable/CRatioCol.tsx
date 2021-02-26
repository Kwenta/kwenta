import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';

import { NO_VALUE } from 'constants/placeholder';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';

import { formatPercent } from 'utils/formatters/number';

import { PriceChangeText } from './common';

type CRatioColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const CRatioCol: FC<CRatioColType> = ({ cellProps }) => {
	const collateralShortPositionQuery = useCollateralShortPositionQuery(
		cellProps.row.original.id,
		cellProps.row.original.txHash,
		true
	);
	const collateralShortPosition = useMemo(
		() => (collateralShortPositionQuery.isSuccess ? collateralShortPositionQuery.data : null),
		[collateralShortPositionQuery]
	);

	return (
		<>
			{collateralShortPosition != null ? (
				<PriceChangeText isPositive={true}>
					{formatPercent(collateralShortPosition.collateralRatio)}
				</PriceChangeText>
			) : (
				<span>{NO_VALUE}</span>
			)}
		</>
	);
};

export default CRatioCol;

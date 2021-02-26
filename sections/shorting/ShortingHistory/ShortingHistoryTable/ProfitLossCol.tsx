import React, { FC, useMemo } from 'react';
import { CellProps } from 'react-table';

import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';

import ProfitLoss from 'sections/shorting/components/ProfitLoss';

type ProfitLossColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const ProfitLossCol: FC<ProfitLossColType> = ({ cellProps }) => {
	const collateralShortPositionQuery = useCollateralShortPositionQuery(
		cellProps.row.original.id,
		cellProps.row.original.txHash,
		true
	);
	const collateralShortPosition = useMemo(
		() => (collateralShortPositionQuery.isSuccess ? collateralShortPositionQuery.data : null),
		[collateralShortPositionQuery]
	);

	return <ProfitLoss value={collateralShortPosition?.profitLoss} />;
};

export default ProfitLossCol;

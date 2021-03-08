import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';

import { NO_VALUE } from 'constants/placeholder';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';
import useCollateralShortContractInfoQuery from 'queries/collateral/useCollateralShortContractInfoQuery';

import { formatPercent } from 'utils/formatters/number';

import { PriceChangeText } from './common';
import { MIN_COLLATERAL_RATIO } from 'sections/shorting/constants';

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
	const collateralShortContractInfoQuery = useCollateralShortContractInfoQuery();

	const collateralShortInfo = useMemo(
		() =>
			collateralShortContractInfoQuery.isSuccess
				? collateralShortContractInfoQuery.data ?? null
				: null,
		[collateralShortContractInfoQuery.isSuccess, collateralShortContractInfoQuery.data]
	);

	const minCollateralRatio = useMemo(
		() => collateralShortInfo?.minCollateralRatio ?? MIN_COLLATERAL_RATIO,
		[collateralShortInfo?.minCollateralRatio]
	);

	return (
		<>
			{collateralShortPosition != null ? (
				<PriceChangeText
					isPositive={collateralShortPosition.collateralRatio.gt(minCollateralRatio)}
				>
					{formatPercent(collateralShortPosition.collateralRatio)}
				</PriceChangeText>
			) : (
				<span>{NO_VALUE}</span>
			)}
		</>
	);
};

export default CRatioCol;

import { NO_VALUE } from 'constants/placeholder';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';
import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import { formatNumber } from 'utils/formatters/number';

import { StyledCurrencyKey, StyledPrice } from './common';

import { DEFAULT_TOKEN_DECIMALS } from 'constants/defaults';

type AccruedInterestColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const AccruedInterestCol: FC<AccruedInterestColType> = ({ cellProps }) => {
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
		<span>
			<StyledPrice>
				{collateralShortPosition != null
					? formatNumber(collateralShortPosition.accruedInterest, {
							minDecimals: DEFAULT_TOKEN_DECIMALS,
					  })
					: NO_VALUE}
			</StyledPrice>
			<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
		</span>
	);
};

export default AccruedInterestCol;

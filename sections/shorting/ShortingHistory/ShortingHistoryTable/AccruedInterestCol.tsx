import { NO_VALUE } from 'constants/placeholder';
import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import useCollateralShortPositionQuery from 'queries/collateral/useCollateralShortPositionQuery';
import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import { formatNumber } from 'utils/formatters/number';

import { StyledCurrencyKey, StyledPrice } from './common';

import {
	DEFAULT_CRYPTO_DECIMALS,
	DEFAULT_FIAT_DECIMALS,
	DEFAULT_NUMBER_DECIMALS,
	DEFAULT_TOKEN_DECIMALS
} from 'constants/defaults';

type AccruedInterestColType = {
	cellProps: CellProps<HistoricalShortPosition>;
};

const AccruedInterestCol: FC<AccruedInterestColType> = ({ cellProps }) => {
	console.log('***AccruedInterestCol');
	const collateralShortPositionQuery = useCollateralShortPositionQuery(
		cellProps.row.original.id,
		cellProps.row.original.txHash,
		true
	);
	const collateralShortPosition = useMemo(
		() => (collateralShortPositionQuery.isSuccess ? collateralShortPositionQuery.data : null),
		[collateralShortPositionQuery]
	);
	console.log('***collateralShortPosition', collateralShortPosition);

	return (
		<span>
			<StyledPrice>
				{collateralShortPosition != null
					? formatNumber(
							collateralShortPosition.accruedInterest,
							{ minDecimals: DEFAULT_TOKEN_DECIMALS },
							true
					  )
					: NO_VALUE}
			</StyledPrice>
			<StyledCurrencyKey>{cellProps.row.original.synthBorrowed}</StyledCurrencyKey>
		</span>
	);
};

export default AccruedInterestCol;

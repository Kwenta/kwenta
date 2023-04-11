import { memo } from 'react';

import {
	selectClosePositionOrderInputs,
	selectClosePositionPreview,
	selectCrossMarginTradeFees,
	selectEditPositionModalInfo,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import FeesRow from './FeesRow.tsx';

const ClosePositionFeeInfo = memo(() => {
	const tradePreview = useAppSelector(selectClosePositionPreview);
	const { market } = useAppSelector(selectEditPositionModalInfo);
	const smartMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const { orderType } = useAppSelector(selectClosePositionOrderInputs);

	return (
		<FeesRow
			executionFee={market?.keeperDeposit ?? zeroBN}
			tradeFee={tradePreview?.fee ?? zeroBN}
			orderType={orderType}
			conditionalOrderFee={smartMarginFees.limitStopOrderFee}
			smartMarginKeeperDeposit={smartMarginFees.keeperEthDeposit}
			rates={{
				maker: market?.feeRates.makerFee ?? zeroBN,
				taker: market?.feeRates.takerFee ?? zeroBN,
			}}
		/>
	);
});

export default ClosePositionFeeInfo;

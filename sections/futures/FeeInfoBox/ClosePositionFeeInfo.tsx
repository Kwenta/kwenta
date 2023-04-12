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
			smartMarginKeeperDeposit={smartMarginFees.keeperEthDeposit}
			rates={{
				maker: market?.feeRates.makerFeeOffchainDelayedOrder ?? zeroBN,
				taker: market?.feeRates.takerFeeOffchainDelayedOrder ?? zeroBN,
			}}
		/>
	);
});

export default ClosePositionFeeInfo;

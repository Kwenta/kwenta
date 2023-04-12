import { memo } from 'react';

import {
	selectCrossMarginTradeFees,
	selectEditPositionModalInfo,
	selectEditPositionPreview,
	selectOrderType,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import FeesRow from './FeesRow.tsx';

const EditPositionFeeInfo = memo(() => {
	const tradePreview = useAppSelector(selectEditPositionPreview);
	const { market } = useAppSelector(selectEditPositionModalInfo);
	const smartMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const orderType = useAppSelector(selectOrderType);

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

export default EditPositionFeeInfo;

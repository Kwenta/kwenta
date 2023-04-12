import { memo } from 'react';

import {
	selectCrossMarginTradeFees,
	selectMarketInfo,
	selectOrderType,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import FeesRow from './FeesRow.tsx';

const TradeTotalFeesRow = memo(() => {
	const tradePreview = useAppSelector(selectTradePreview);
	const marketInfo = useAppSelector(selectMarketInfo);
	const smartMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const orderType = useAppSelector(selectOrderType);

	return (
		<FeesRow
			executionFee={marketInfo?.keeperDeposit ?? zeroBN}
			tradeFee={tradePreview?.fee ?? zeroBN}
			orderType={orderType}
			smartMarginKeeperDeposit={smartMarginFees.keeperEthDeposit}
			rates={{
				maker: marketInfo?.feeRates.makerFeeOffchainDelayedOrder ?? zeroBN,
				taker: marketInfo?.feeRates.takerFeeOffchainDelayedOrder ?? zeroBN,
			}}
		/>
	);
});

export default TradeTotalFeesRow;

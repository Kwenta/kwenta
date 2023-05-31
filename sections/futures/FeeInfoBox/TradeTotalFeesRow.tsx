import { memo } from 'react';

import {
	selectSmartMarginKeeperDeposit,
	selectMarketInfo,
	selectOrderType,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { zeroBN } from 'sdk/utils/number';

import FeesRow from './FeesRow.tsx';

const TradeTotalFeesRow = memo(() => {
	const tradePreview = useAppSelector(selectTradePreview);
	const marketInfo = useAppSelector(selectMarketInfo);
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit);
	const orderType = useAppSelector(selectOrderType);

	return (
		<FeesRow
			executionFee={marketInfo?.keeperDeposit ?? zeroBN}
			tradeFee={tradePreview?.fee ?? zeroBN}
			orderType={orderType}
			smartMarginKeeperDeposit={keeperEthDeposit}
			rates={{
				maker: marketInfo?.feeRates.makerFeeOffchainDelayedOrder ?? zeroBN,
				taker: marketInfo?.feeRates.takerFeeOffchainDelayedOrder ?? zeroBN,
			}}
		/>
	);
});

export default TradeTotalFeesRow;

import { toBigNumber, zeroBN } from 'utils/formatters/number';
import { PositionDetail, FuturesPosition } from './types';

export const mapFuturesPosition = (
	positionDetail: PositionDetail,
	canLiquidatePosition: boolean,
	asset: string
): FuturesPosition => {
	const {
		remainingMargin,
		orderPending,
		order,
		position: { fundingIndex, lastPrice, size, margin },
		accruedFunding,
		notionalValue,
		liquidationPrice,
		profitLoss,
	} = positionDetail;
	return {
		asset,
		order: !!orderPending
			? {
					pending: !!orderPending,
					fee: toBigNumber(order.fee.toString()),
					leverage: toBigNumber(order.leverage.toString()),
			  }
			: null,
		margin: toBigNumber(margin.toString()),
		position: toBigNumber(size.toString()).isZero()
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					isLong: toBigNumber(size.toString()).isGreaterThan(zeroBN),
					notionalValue: toBigNumber(notionalValue.toString()),
					accruedFunding: toBigNumber(accruedFunding.toString()),
					remainingMargin: toBigNumber(remainingMargin.toString()),
					profitLoss: toBigNumber(profitLoss.toString()),
					fundingIndex: Number(fundingIndex.toString()),
					lastPrice: toBigNumber(lastPrice.toString()),
					size: toBigNumber(size.toString()),
					liquidationPrice: toBigNumber(liquidationPrice.toString()),
					leverage: toBigNumber(remainingMargin.toString()).isZero()
						? zeroBN
						: toBigNumber(notionalValue.toString()).dividedBy(
								toBigNumber(remainingMargin.toString())
						  ),
			  },
	};
};

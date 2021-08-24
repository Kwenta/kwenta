import { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';

import { zeroBN } from 'utils/formatters/number';
import { PositionDetail, FuturesPosition, PositionSide } from './types';

export const getFuturesMarketContract = (
	asset: string | null,
	contracts: Record<string, Contract>
) => {
	if (!asset) throw new Error(`Asset needs to be specified`);
	const contractName = `FuturesMarket${asset.substring(1)}`;
	const contract = contracts[contractName];
	if (!contract) throw new Error(`${contractName} for ${asset} does not exist`);
	return contract;
};

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
	const roi = wei(profitLoss).add(wei(accruedFunding));
	return {
		asset,
		order: !!orderPending
			? {
					pending: !!orderPending,
					fee: wei(order.fee),
					leverage: wei(order.leverage),
					side: wei(order.leverage).gte(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
			  }
			: null,
		remainingMargin: wei(remainingMargin),
		position: wei(size).eq(zeroBN)
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					side: wei(size).gt(zeroBN) ? PositionSide.LONG : PositionSide.SHORT,
					notionalValue: wei(notionalValue),
					accruedFunding: wei(accruedFunding),
					initialMargin: wei(margin),
					profitLoss: wei(profitLoss),
					fundingIndex: Number(fundingIndex),
					lastPrice: wei(lastPrice),
					size: wei(size).abs(),
					liquidationPrice: wei(liquidationPrice),
					initialLeverage: wei(size).mul(wei(lastPrice)).div(wei(margin)).abs(),
					roi,
					roiChange: wei(margin).eq(zeroBN) ? zeroBN : roi.div(wei(margin)),
					marginRatio: wei(notionalValue).eq(zeroBN)
						? zeroBN
						: wei(remainingMargin).div(wei(notionalValue).abs()),
					leverage: wei(remainingMargin).eq(zeroBN)
						? zeroBN
						: wei(notionalValue).div(wei(remainingMargin)).abs(),
			  },
	};
};

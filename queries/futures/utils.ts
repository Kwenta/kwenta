import { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';

import { zeroBN } from 'utils/formatters/number';
import { PositionDetail, FuturesPosition } from './types';

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
	return {
		asset,
		order: !!orderPending
			? {
					pending: !!orderPending,
					fee: wei(order.fee),
					leverage: wei(order.leverage),
			  }
			: null,
		margin: wei(margin),
		position: wei(size).eq(zeroBN)
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					isLong: wei(size).gt(zeroBN),
					notionalValue: wei(notionalValue),
					accruedFunding: wei(accruedFunding),
					remainingMargin: wei(remainingMargin),
					profitLoss: wei(profitLoss),
					fundingIndex: Number(fundingIndex),
					lastPrice: wei(lastPrice),
					size: wei(size),
					liquidationPrice: wei(liquidationPrice),
					leverage: wei(remainingMargin).eq(zeroBN)
						? zeroBN
						: wei(notionalValue).div(wei(remainingMargin)),
			  },
	};
};

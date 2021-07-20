import { BigNumber as EthersBN } from 'ethers';
import BigNumber from 'bignumber.js';

export type PositionDetail = {
	remainingMargin: EthersBN;
	orderPending: boolean;
	order: {
		pending: boolean;
		fee: EthersBN;
		leverage: EthersBN;
	};
	position: {
		fundingIndex: EthersBN;
		lastPrice: EthersBN;
		size: EthersBN;
		margin: EthersBN;
	};
	accruedFunding: EthersBN;
	notionalValue: EthersBN;
	liquidationPrice: EthersBN;
	profitLoss: EthersBN;
};

export type FuturesPosition = {
	asset: string;
	order: { pending: boolean; fee: BigNumber; leverage: BigNumber } | null;
	margin: BigNumber;
	position: {
		canLiquidatePosition: boolean;
		isLong: boolean;
		notionalValue: BigNumber;
		accruedFunding: BigNumber;
		remainingMargin: BigNumber;
		profitLoss: BigNumber;
		fundingIndex: number;
		lastPrice: BigNumber;
		size: BigNumber;
		liquidationPrice: BigNumber;
		leverage: BigNumber;
	} | null;
};

export type FuturesMarket = {
	market: string;
	asset: string;
	assetHex: string;
	currentFundingRate: BigNumber;
	feeRates: {
		makerFee: BigNumber;
		takerFee: BigNumber;
	};
	marketDebt: BigNumber;
	marketSkew: BigNumber;
	maxLeverage: BigNumber;
	price: BigNumber;
};

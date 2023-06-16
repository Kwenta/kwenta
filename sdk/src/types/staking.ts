import { BigNumber } from "ethers";

export type TradingRewardProps = {
	period: number | string;
	start?: number;
	end?: number;
};

export type FuturesFeeForAccountProps = {
	timestamp: number;
	account: string;
	abstractAccount: string;
	accountType: string;
	feesPaid: BigNumber;
	keeperFeesPaid: BigNumber;
};

export type FuturesFeeProps = {
	timestamp: string;
	feesKwenta: BigNumber;
};
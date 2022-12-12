import { BigNumber } from 'ethers';

export type ModalType =
	| 'futures_cross_deposit'
	| 'futures_cross_withdraw'
	| 'futures_cross_leverage'
	| 'futures_isolated_transfer'
	| 'futures_close_position_confirm'
	| 'futures_modify_position_confirm'
	| null;

export type GasSpeed = 'average' | 'fast' | 'fastest';

export type GasPrice<T = BigNumber> = {
	baseFeePerGas?: T; // Note that this is used for estimating price and should not be included in the transaction
	maxPriorityFeePerGas?: T;
	maxFeePerGas?: T;
	gasPrice?: T;
};

export type AppState = {
	openModal: ModalType;
	gasSpeed: GasSpeed;
	gasPrice: GasPrice<string>;
};

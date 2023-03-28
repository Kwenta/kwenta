import { BigNumber } from 'ethers';

import { TransactionStatus } from 'sdk/types/common';
import { FuturesTransactionType } from 'state/futures/types';

export type ModalType =
	| 'futures_cross_deposit'
	| 'futures_close_position_confirm'
	| 'futures_cross_withdraw'
	| 'futures_cross_leverage'
	| 'futures_edit_position_margin'
	| 'futures_edit_position_size'
	| 'futures_isolated_transfer'
	| 'futures_modify_position_confirm'
	| 'futures_withdraw_keeper_balance'
	| null;

export type GasSpeed = 'average' | 'fast' | 'fastest';

export type GasPrice<T = BigNumber> = {
	baseFeePerGas?: T; // Note that this is used for estimating price and should not be included in the transaction
	maxPriorityFeePerGas?: T;
	maxFeePerGas?: T;
	gasPrice?: T;
};

export type TransactionType = FuturesTransactionType; // TODO: Support all types

export type Transaction = {
	type: TransactionType;
	status: TransactionStatus;
	error?: string;
	hash: string | null;
};

export type AppState = {
	openModal: ModalType;
	gasSpeed: GasSpeed;
	gasPrice: GasPrice<string>;
	transaction?: Transaction | undefined;
	synthetixOnMaintenance: boolean;
};

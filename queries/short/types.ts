import { CurrencyKey } from 'constants/currency';

export type Short = {
	id: number;
	txHash: string;
	account: string;
	collateralLocked: CurrencyKey;
	collateralLockedAmount: number;
	collateralLockedPrice: number;
	synthBorrowed: CurrencyKey;
	synthBorrowedAmount: number;
	synthBorrowedPrice: number;
	createdAt: number;
	closedAt: number | null;
	isOpen: boolean;
	contractData?: ShortContract;
	interestAccrued: number;
	collateralChanges?: ShortCollateralChange[];
	liquidations?: ShortLiquidation[];
	loanChanges?: ShortLoanChange[];
};

export type ShortCollateralChange = {
	id: string;
	isDeposit: boolean;
	amount: number;
	collateralAfter: number;
	short?: Short;
	timestamp: number;
};

export type ShortLoanChange = {
	id: string;
	isRepayment: boolean;
	amount: number;
	loanAfter: number;
	short?: Short;
	timestamp: number;
};

export type ShortLiquidation = {
	id: string;
	liquidator: string;
	isClosed: boolean;
	liquidatedAmount: number;
	liquidatedCollateral: number;
	short?: Short;
	timestamp: number;
};

export type ShortContract = {
	id: string;
	shorts?: Short[];
	contractUpdates?: ShortContractUpdate[];
	canOpenLoans: boolean;
	interactionDelay: number;
	issueFeeRate: number;
	maxLoansPerAccount: number;
	minCollateral: number;
	minCratio: number;
	manager: string;
};

export type ShortContractUpdate = {
	id: string;
	field: string;
	value: string;
	contractData?: ShortContract;
	timestamp: number;
};

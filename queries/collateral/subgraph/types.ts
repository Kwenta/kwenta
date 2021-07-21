import Wei from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';

export type HistoricalShortPosition = {
	id: string;
	txHash: string;
	collateralLocked: CurrencyKey;
	collateralLockedAmount: Wei;
	synthBorrowed: CurrencyKey;
	synthBorrowedAmount: Wei;
	createdAt: Date;
	closedAt: Date | null;
	isOpen: boolean;
	accruedInterest: Wei;
	collateralChanges?: ShortCollateralChange[];
	liquidations?: ShortLiquidation[];
	loanChanges?: ShortLoanChange[];
	profitLoss: Wei | null;
};

export type ShortCollateralChange = {
	id: string;
	isDeposit: boolean;
	amount: Wei;
	collateralAfter: Wei;
	short?: HistoricalShortPosition;
	timestamp: number;
};

export type ShortLoanChange = {
	id: string;
	isRepayment: boolean;
	amount: Wei;
	loanAfter: Wei;
	short?: HistoricalShortPosition;
	timestamp: number;
};

export type ShortLiquidation = {
	id: string;
	liquidator: string;
	isClosed: boolean;
	liquidatedAmount: Wei;
	liquidatedCollateral: Wei;
	short?: HistoricalShortPosition;
	timestamp: number;
};

export type ShortContractUpdate = {
	id: string;
	field: string;
	value: string;
	timestamp: number;
};

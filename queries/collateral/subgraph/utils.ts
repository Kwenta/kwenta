import { HistoricalShortPosition, ShortLiquidation } from './types';
import { hexToAscii } from 'utils/formatters/string';
import { toBigNumber } from 'utils/formatters/number';

export const SHORT_GRAPH_ENDPOINT =
	'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-shorts';

// TODO use big number anywhere - don't think these are related to input fields so not yet?
export const formatShort = (response: any): Partial<HistoricalShortPosition> => ({
	id: response.id,
	txHash: response.txHash,
	collateralLocked: hexToAscii(response.collateralLocked),
	collateralLockedAmount: toBigNumber(response.collateralLockedAmount / 1e18),
	synthBorrowed: hexToAscii(response.synthBorrowed),
	synthBorrowedAmount: toBigNumber(response.synthBorrowedAmount / 1e18),
	createdAt: new Date(Number(response.createdAt) * 1000),
	closedAt: response.closedAt != null ? new Date(Number(response.closedAt) * 1000) : null,
	isOpen: Boolean(response.isOpen),
	collateralChanges: (response?.collateralChanges ?? []).map(formatShortCollateralChanges),
	liquidations: (response?.liquidations ?? []).map(formatShortLiquidations),
	loanChanges: (response?.loanChanges ?? []).map(formatShortLoanChanges),
	accruedInterest: toBigNumber(1),
	profitLoss: null,
});

export const formatShortLiquidations = (response: any): ShortLiquidation => ({
	id: response.id,
	isClosed: Boolean(response.isClosed),
	liquidatedAmount: response.liquidatedAmount / 1e18,
	liquidatedCollateral: response.liquidatedCollateral / 1e18,
	liquidator: response.liquidator,
	timestamp: Number(response.timestamp) * 1000,
});

export const formatShortCollateralChanges = (response: any) => ({
	amount: response.amount / 1e18,
	collateralAfter: response.collateralAfter,
	id: response.id,
	isDeposit: Boolean(response.isDeposit),
	timestamp: Number(response.timestamp) * 1000,
});

export const formatShortLoanChanges = (response: any) => ({
	amount: response.amount / 1e18,
	id: response.id,
	isRepayment: Boolean(response.isRepayment),
	loanAfter: response.loanAfter / 1e18,
	timestamp: Number(response.timestamp) * 1000,
});

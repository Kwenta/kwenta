import { HistoricalShortPosition, ShortLiquidation } from './types';
import { hexToAscii } from 'utils/formatters/string';

// MainNet - 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-shorts';
// Kovan - 'https://api.thegraph.com/subgraphs/name/vbstreetz/synthetix-shorts-kovan'

export const SHORT_GRAPH_ENDPOINT =
	'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-shorts';

export const formatShort = (response: any): Partial<HistoricalShortPosition> => ({
	id: response.id,
	txHash: response.txHash,
	collateralLocked: hexToAscii(response.collateralLocked),
	collateralLockedAmount: response.collateralLockedAmount,
	synthBorrowed: hexToAscii(response.synthBorrowed),
	synthBorrowedAmount: response.synthBorrowedAmount,
	createdAt: new Date(Number(response.createdAt) * 1000),
	closedAt: response.closedAt != null ? new Date(Number(response.closedAt) * 1000) : null,
	isOpen: Boolean(response.isOpen),
	collateralChanges: (response?.collateralChanges ?? []).map(formatShortCollateralChanges),
	liquidations: (response?.liquidations ?? []).map(formatShortLiquidations),
	loanChanges: (response?.loanChanges ?? []).map(formatShortLoanChanges),
});

export const formatShortLiquidations = (response: any): ShortLiquidation => ({
	id: response.id,
	isClosed: Boolean(response.isClosed),
	liquidatedAmount: response.liquidatedAmount,
	liquidatedCollateral: response.liquidatedCollateral,
	liquidator: response.liquidator,
	timestamp: Number(response.timestamp) * 1000,
});

export const formatShortCollateralChanges = (response: any) => ({
	amount: response.amount,
	collateralAfter: response.collateralAfter,
	id: response.id,
	isDeposit: Boolean(response.isDeposit),
	timestamp: Number(response.timestamp) * 1000,
});

export const formatShortLoanChanges = (response: any) => ({
	amount: response.amount,
	id: response.id,
	isRepayment: Boolean(response.isRepayment),
	loanAfter: response.loanAfter,
	timestamp: Number(response.timestamp) * 1000,
});

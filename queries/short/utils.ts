import { Short, ShortContract, ShortLiquidation } from './types';
import { hexToAscii } from 'utils/formatters/string';

export const SHORT_GRAPH_ENDPOINT =
	'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-shorts';

// TODO use big number anywhere - don't think these are related to input fields so not yet?
export const formatShort = (response: any): Partial<Short> => ({
	id: Number(response.id),
	txHash: response.txHash,
	account: response.account,
	collateralLocked: hexToAscii(response.collateralLocked),
	collateralLockedAmount: response.collateralLockedAmount / 1e18,
	synthBorrowed: hexToAscii(response.synthBorrowed),
	synthBorrowedAmount: response.synthBorrowedAmount / 1e18,
	createdAt: Number(response.createdAt) * 1000,
	closedAt: response.closedAt != null ? Number(response.closedAt) * 1000 : null,
	isOpen: Boolean(response.isOpen),
	contractData: formatShortContractData(response.contractData),
	collateralChanges: (response?.collateralChanges ?? []).map(formatShortCollateralChanges),
	liquidations: (response?.liquidations ?? []).map(formatShortLiquidations),
	loanChanges: (response?.loanChanges ?? []).map(formatShortLoanChanges),
});

export const formatShortContractData = (response: any): ShortContract => ({
	id: response.id,
	canOpenLoans: Boolean(response.canOpenLoans),
	interactionDelay: Number(response.interactionDelay),
	issueFeeRate: response.issueFeeRate / 1e18,
	manager: response.manager,
	maxLoansPerAccount: response.maxLoansPerAccount,
	minCollateral: response.minCollateral / 1e18,
	minCratio: response.minCratio / 1e18,
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

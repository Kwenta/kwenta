import { gql } from 'graphql-request';

export const shortsQuery = gql`
	query shorts($account: String!) {
		shorts(first: 100, where: { account: $account }, orderBy: id, orderDirection: desc) {
			id
			contractData {
				issueFeeRate
				canOpenLoans
				minCratio
				minCollateral
				maxLoansPerAccount
				interactionDelay
				manager
			}
			txHash
			account
			collateralLocked
			collateralLockedAmount
			synthBorrowed
			synthBorrowedAmount
			isOpen
			createdAt
			closedAt
			liquidations {
				id
				liquidator
				isClosed
				liquidatedAmount
				liquidatedCollateral
				timestamp
			}
			collateralChanges {
				id
				isDeposit
				amount
				collateralAfter
				timestamp
			}
			loanChanges {
				id
				amount
				isRepayment
				loanAfter
				timestamp
			}
		}
	}
`;

export const shortContractQuery = gql`
	query shortContracts($account: String!) {
		shortContracts(first: 1, where: { id: $account }) {
			id
			issueFeeRate
			canOpenLoans
			minCratio
			minCollateral
			maxLoansPerAccount
			interactionDelay
			manager
		}
	}
`;

import { TransactionStatus } from '@kwenta/sdk/dist/types'

import { QueryStatus } from 'state/types'

export type MigrationInfo = {
	registeredVestingEntryIDs: number[]
	unregisteredVestingEntryIDs: number[]
	unvestedRegisteredEntryIDs: number[]
	unmigratedRegisteredEntryIDs: number[]
	toPay: string
	escrowMigratorAllowance: string
	totalEscrowUnmigrated: string
	migrationPeriod: {
		start: number
		end: number
	}
}

export type StakingMigrationState = {
	selectedUserMigrationInfo: {
		[wallet: string]: MigrationInfo
	}
	fetchRegisteredVestingEntryIDsStatus: QueryStatus
	fetchUnregisteredVestingEntryIDsStatus: QueryStatus
	fetchUnvestedRegisteredEntryIDsStatus: QueryStatus
	fetchUnmigratedRegisteredEntryIDsStatus: QueryStatus
	fetchToPayStatus: QueryStatus
	fetchMigrationDeadlineStatus: QueryStatus
	fetchEscrowMigratorAllowanceStatus: QueryStatus
	fetchTotalEscrowUnmigratedStatus: QueryStatus
}

export type StakingMigrationTransactionType =
	| 'register_entries'
	| 'approve_escrow_migrator'
	| 'migrate_entries'

export type StakingMigrationlTransaction = {
	type: StakingMigrationTransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

export type MigrationPeriod = {
	start: number
	end: number
}

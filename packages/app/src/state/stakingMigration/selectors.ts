import { TransactionStatus } from '@kwenta/sdk/types'
import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state/store'
import { selectWallet } from 'state/wallet/selectors'

const selectSelectedUserMigrationInfo = (state: RootState) =>
	state.stakingMigration.selectedUserMigrationInfo

export const selectUnregisteredVestingEntryIDs = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return []
		return migrationInfo[wallet].unregisteredVestingEntryIDs
	}
)

export const selectNumberOfUnregisteredEntries = createSelector(
	selectUnregisteredVestingEntryIDs,
	(unregisteredVestingEntryIDs) => unregisteredVestingEntryIDs?.length
)

export const selectUnvestedRegisteredEntryIDs = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return []
		return migrationInfo[wallet]?.unvestedRegisteredEntryIDs
	}
)

export const selectNumberOfUnvestedRegisteredEntries = createSelector(
	selectUnvestedRegisteredEntryIDs,
	(unvestedRegisteredEntryIDs) => unvestedRegisteredEntryIDs?.length
)

const selectToPay = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return toWei('0')
		return toWei(migrationInfo[wallet]?.toPay)
	}
)

const selectEscrowMigratorAllowance = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return toWei('0')
		return toWei(migrationInfo[wallet]?.escrowMigratorAllowance)
	}
)

export const selectNeedEscrowMigratorApproval = createSelector(
	selectEscrowMigratorAllowance,
	selectToPay,
	(escrowMigratorAllowance, toPay) => escrowMigratorAllowance.lt(toPay)
)

export const selectUnmigratedRegisteredEntryIDs = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return []
		return migrationInfo[wallet]?.unmigratedRegisteredEntryIDs
	}
)

export const selectNumberOfUnmigratedRegisteredEntries = createSelector(
	selectUnmigratedRegisteredEntryIDs,
	(unmigratedRegisteredEntryIDs) => unmigratedRegisteredEntryIDs?.length
)

const selectMigrationStartTime = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return 0
		return migrationInfo[wallet]?.migrationPeriod.start
	}
)

const selectMigrationDeadline = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return 0
		return migrationInfo[wallet]?.migrationPeriod.end
	}
)

export const selectIsMigrationPeriodStarted = createSelector(
	selectMigrationStartTime,
	(migrationStartTime) => migrationStartTime > 0
)

export const selectMigrationSecondsLeft = createSelector(
	selectMigrationStartTime,
	selectMigrationDeadline,
	(migrationStartTime, migrationDeadline) => {
		return migrationStartTime > 0 ? Math.ceil(migrationDeadline - Date.now() / 1000) : 0
	}
)

export const selectInMigrationPeriod = createSelector(
	selectMigrationSecondsLeft,
	(migrationSecondsLeft) => migrationSecondsLeft > 0
)

const selectRegisteredVestingEntryIDs = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return []
		return migrationInfo[wallet]?.registeredVestingEntryIDs
	}
)

export const selectNumberOfRegisteredEntries = createSelector(
	selectRegisteredVestingEntryIDs,
	(registeredVestingEntryIDs) => registeredVestingEntryIDs?.length
)

export const selectSubmittingMigrationTx = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (
			app.transaction?.status === TransactionStatus.AwaitingExecution ||
			app.transaction?.status === TransactionStatus.Executed
		)
	}
)

export const selectIsRegisteringEntries = createSelector(
	selectSubmittingMigrationTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return submitting && app.transaction?.type === 'register_entries'
	}
)

export const selectIsApprovingEscrowMigrator = createSelector(
	selectSubmittingMigrationTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return submitting && app.transaction?.type === 'approve_escrow_migrator'
	}
)

export const selectIsMigratingEntries = createSelector(
	selectSubmittingMigrationTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return submitting && app.transaction?.type === 'migrate_entries'
	}
)

export const selectTotalEscrowUnmigrated = createSelector(
	selectWallet,
	selectSelectedUserMigrationInfo,
	(wallet, migrationInfo) => {
		if (!wallet) return toWei('0')
		return toWei(migrationInfo[wallet]?.totalEscrowUnmigrated)
	}
)

export const selectStartMigration = createSelector(
	selectTotalEscrowUnmigrated,
	selectInMigrationPeriod,
	(totalEscrowUnmigrated, inMigrationPeriod) => totalEscrowUnmigrated.gt(0) && inMigrationPeriod
)

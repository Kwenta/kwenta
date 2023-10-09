import { createSlice } from '@reduxjs/toolkit'

import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'

import {
	fetchEscrowMigratorAllowance,
	fetchMigrationDeadline,
	fetchRegisteredVestingEntryIDs,
	fetchToPay,
	fetchTotalEscrowUnmigrated,
	fetchUnmigratedRegisteredEntryIDs,
	fetchUnregisteredVestingEntryIDs,
	fetchUnvestedRegisteredEntryIDs,
} from './actions'
import { StakingMigrationState } from './types'

export const DEFAULT_MIGRATION_INFO = {
	registeredVestingEntryIDs: [],
	unregisteredVestingEntryIDs: [],
	unvestedRegisteredEntryIDs: [],
	unmigratedRegisteredEntryIDs: [],
	toPay: '0',
	escrowMigratorAllowance: '0',
	totalEscrowUnmigrated: '0',
	migrationPeriod: {
		start: 0,
		end: 0,
	},
}

export const STAKING_MIGRATION_INITIAL_STATE: StakingMigrationState = {
	fetchRegisteredVestingEntryIDsStatus: DEFAULT_QUERY_STATUS,
	fetchUnregisteredVestingEntryIDsStatus: DEFAULT_QUERY_STATUS,
	fetchUnvestedRegisteredEntryIDsStatus: DEFAULT_QUERY_STATUS,
	fetchUnmigratedRegisteredEntryIDsStatus: DEFAULT_QUERY_STATUS,
	fetchEscrowMigratorAllowanceStatus: DEFAULT_QUERY_STATUS,
	fetchToPayStatus: DEFAULT_QUERY_STATUS,
	fetchMigrationDeadlineStatus: DEFAULT_QUERY_STATUS,
	fetchTotalEscrowUnmigratedStatus: DEFAULT_QUERY_STATUS,
	selectedUserMigrationInfo: {},
}

export const stakingMigrationSlice = createSlice({
	name: 'stakingMigration',
	initialState: STAKING_MIGRATION_INITIAL_STATE,
	reducers: {
		setSelectedUserMigrationInfo: (state, { payload }) => {
			state.selectedUserMigrationInfo[payload] = DEFAULT_MIGRATION_INFO
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchRegisteredVestingEntryIDs.pending, (state) => {
			state.fetchRegisteredVestingEntryIDsStatus = LOADING_STATUS
		})
		builder.addCase(fetchRegisteredVestingEntryIDs.fulfilled, (state, { payload }) => {
			state.fetchRegisteredVestingEntryIDsStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].registeredVestingEntryIDs =
				payload.registeredVestingEntryIDs
		})
		builder.addCase(fetchRegisteredVestingEntryIDs.rejected, (state) => {
			state.fetchRegisteredVestingEntryIDsStatus = {
				error: 'Failed to fetch registered vesting entry ids',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchUnregisteredVestingEntryIDs.pending, (state) => {
			state.fetchUnregisteredVestingEntryIDsStatus = LOADING_STATUS
		})
		builder.addCase(fetchUnregisteredVestingEntryIDs.fulfilled, (state, { payload }) => {
			state.fetchUnregisteredVestingEntryIDsStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].unregisteredVestingEntryIDs =
				payload.unregisteredVestingEntryIDs
		})
		builder.addCase(fetchUnregisteredVestingEntryIDs.rejected, (state) => {
			state.fetchUnregisteredVestingEntryIDsStatus = {
				error: 'Failed to fetch unregistered vesting entry ids',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchUnvestedRegisteredEntryIDs.pending, (state) => {
			state.fetchUnvestedRegisteredEntryIDsStatus = LOADING_STATUS
		})
		builder.addCase(fetchUnvestedRegisteredEntryIDs.fulfilled, (state, { payload }) => {
			state.fetchUnvestedRegisteredEntryIDsStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].unvestedRegisteredEntryIDs =
				payload.unvestedRegisteredEntryIDs
		})
		builder.addCase(fetchUnvestedRegisteredEntryIDs.rejected, (state) => {
			state.fetchUnvestedRegisteredEntryIDsStatus = {
				error: 'Failed to fetch unvested registered entry ids',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchUnmigratedRegisteredEntryIDs.pending, (state) => {
			state.fetchUnmigratedRegisteredEntryIDsStatus = LOADING_STATUS
		})
		builder.addCase(fetchUnmigratedRegisteredEntryIDs.fulfilled, (state, { payload }) => {
			state.fetchUnmigratedRegisteredEntryIDsStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].unmigratedRegisteredEntryIDs =
				payload.unmigratedRegisteredEntryIDs
		})
		builder.addCase(fetchUnmigratedRegisteredEntryIDs.rejected, (state) => {
			state.fetchUnmigratedRegisteredEntryIDsStatus = {
				error: 'Failed to fetch unmigrated registered entry ids',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchToPay.pending, (state) => {
			state.fetchToPayStatus = LOADING_STATUS
		})
		builder.addCase(fetchToPay.fulfilled, (state, { payload }) => {
			state.fetchToPayStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].toPay = payload.toPay
		})
		builder.addCase(fetchToPay.rejected, (state) => {
			state.fetchToPayStatus = {
				error: 'Failed to fetch to pay',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchEscrowMigratorAllowance.pending, (state) => {
			state.fetchEscrowMigratorAllowanceStatus = LOADING_STATUS
		})
		builder.addCase(fetchEscrowMigratorAllowance.fulfilled, (state, { payload }) => {
			state.fetchEscrowMigratorAllowanceStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].escrowMigratorAllowance =
				payload.escrowMigratorAllowance
		})
		builder.addCase(fetchEscrowMigratorAllowance.rejected, (state) => {
			state.fetchEscrowMigratorAllowanceStatus = {
				error: 'Failed to fetch escrow migrator allowance',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchMigrationDeadline.pending, (state) => {
			state.fetchMigrationDeadlineStatus = LOADING_STATUS
		})
		builder.addCase(fetchMigrationDeadline.fulfilled, (state, { payload }) => {
			state.fetchMigrationDeadlineStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].migrationPeriod = payload.migrationPeriod
		})
		builder.addCase(fetchMigrationDeadline.rejected, (state) => {
			state.fetchMigrationDeadlineStatus = {
				error: 'Failed to fetch migration deadline',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchTotalEscrowUnmigrated.pending, (state) => {
			state.fetchTotalEscrowUnmigratedStatus = LOADING_STATUS
		})
		builder.addCase(fetchTotalEscrowUnmigrated.fulfilled, (state, { payload }) => {
			state.fetchTotalEscrowUnmigratedStatus = SUCCESS_STATUS
			if (!state.selectedUserMigrationInfo[payload.wallet]) {
				state.selectedUserMigrationInfo[payload.wallet] = DEFAULT_MIGRATION_INFO
			}
			state.selectedUserMigrationInfo[payload.wallet].totalEscrowUnmigrated =
				payload.totalEscrowUnmigrated
		})
		builder.addCase(fetchTotalEscrowUnmigrated.rejected, (state) => {
			state.fetchTotalEscrowUnmigratedStatus = {
				error: 'Failed to fetch total unmigrated escrow',
				status: FetchStatus.Error,
			}
		})
	},
})

export default stakingMigrationSlice.reducer
export const { setSelectedUserMigrationInfo } = stakingMigrationSlice.actions

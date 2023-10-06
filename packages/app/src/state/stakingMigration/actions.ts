import { TransactionStatus } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setTransaction } from 'state/app/reducer'
import { fetchMigrationDetails } from 'state/staking/actions'
import { selectStakingSupportedNetwork } from 'state/staking/selectors'
import { ThunkConfig } from 'state/types'
import { selectWallet } from 'state/wallet/selectors'
import logError from 'utils/logError'

import { MigrationPeriod } from './types'

export const registerEntries = createAsyncThunk<void, number[], ThunkConfig>(
	'stakingMigration/registerEntries',
	async (ids, { dispatch, getState, extra: { sdk } }) => {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const supportedNetwork = selectStakingSupportedNetwork(getState())
		if (!supportedNetwork)
			throw new Error(
				'Registering entries is unsupported on this network. Please switch to Optimism.'
			)

		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'register_entries',
					hash: null,
				})
			)

			const tx = await sdk.stakingMigration.registerEntries(ids)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchMigrationDetails())
		} catch (err) {
			logError(err)
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const approveEscrowMigrator = createAsyncThunk<void, void, ThunkConfig>(
	'stakingMigration/approveEscrowMigrator',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')
		const supportedNetwork = selectStakingSupportedNetwork(getState())
		if (!supportedNetwork)
			throw new Error(
				'Approving EscrowMigrator is unsupported on this network. Please switch to Optimism.'
			)

		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'approve_escrow_migrator',
					hash: null,
				})
			)
			const tx = await sdk.stakingMigration.approveKwentaTokenEscrowMigrator(wallet)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchMigrationDetails())
		} catch (err) {
			logError(err)
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const migrateEntries = createAsyncThunk<void, number[], ThunkConfig>(
	'stakingMigration/migrateEntries',
	async (ids, { dispatch, getState, extra: { sdk } }) => {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const supportedNetwork = selectStakingSupportedNetwork(getState())
		if (!supportedNetwork)
			throw new Error(
				'Migrating entries is unsupported on this network. Please switch to Optimism.'
			)

		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'migrate_entries',
					hash: null,
				})
			)
			const tx = await sdk.stakingMigration.migrateEntries(ids)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchMigrationDetails())
		} catch (err) {
			logError(err)
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const fetchUnregisteredVestingEntryIDs = createAsyncThunk<
	{ unregisteredVestingEntryIDs: number[]; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchUnregisteredVestingEntryIDs', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const registeredVestingEntryIDs = (
			await sdk.stakingMigration.getRegisteredVestingEntryIDs()
		).map((id) => Number(id))
		const vestingEntryIDs = await sdk.stakingMigration.getVestingEntryIDs()
		const unregisteredVestingEntryIDs = vestingEntryIDs.filter(
			(id) => !registeredVestingEntryIDs.includes(id)
		)
		return {
			unregisteredVestingEntryIDs,
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch unregistered vesting entry ids', err)
		throw err
	}
})

export const fetchRegisteredVestingEntryIDs = createAsyncThunk<
	{ registeredVestingEntryIDs: number[]; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchRegisteredVestingEntryIDs', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const registeredVestingEntryIDs = await sdk.stakingMigration.getRegisteredVestingEntryIDs()

		return {
			registeredVestingEntryIDs: registeredVestingEntryIDs.map((id) => Number(id)),
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch registered vesting entry ids', err)
		throw err
	}
})

export const fetchUnvestedRegisteredEntryIDs = createAsyncThunk<
	{ unvestedRegisteredEntryIDs: number[]; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchUnvestedRegisteredEntryIDs', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const registeredVestingEntryIDs = await sdk.stakingMigration.getRegisteredVestingEntryIDs()
		const vestingEntryIDs = await sdk.stakingMigration.getVestingEntryIDs()
		const unvestedRegisteredEntryIDs = registeredVestingEntryIDs
			.map((id) => Number(id))
			.filter((id) => vestingEntryIDs.includes(id))
		return {
			unvestedRegisteredEntryIDs,
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch unvested registered entry ids', err)
		throw err
	}
})

export const fetchUnmigratedRegisteredEntryIDs = createAsyncThunk<
	{ unmigratedRegisteredEntryIDs: number[]; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchUnmigratedRegisteredEntryIDs', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const registeredVestingEntryIDs = await sdk.stakingMigration.getRegisteredVestingSchedules()
		const unmigratedRegisteredEntryIDs = registeredVestingEntryIDs
			.filter((schedule) => !schedule.migrated)
			.map(({ entryID }) => Number(entryID))
		return {
			unmigratedRegisteredEntryIDs,
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch unmigrated registered vesting entry ids', err)
		throw err
	}
})

export const fetchMigrationDeadline = createAsyncThunk<
	{ migrationPeriod: MigrationPeriod; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchMigrationDeadline', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')
		const { startBN, endBN } = await sdk.stakingMigration.getMigrationDeadline()
		return {
			migrationPeriod: {
				start: startBN.toNumber(),
				end: endBN.toNumber(),
			},
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch migration deadline', err)
		throw err
	}
})

export const fetchToPay = createAsyncThunk<{ toPay: string; wallet: string }, void, ThunkConfig>(
	'stakingMigration/fetchToPay',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const wallet = selectWallet(getState())
			if (!wallet) throw new Error('Wallet not connected')

			const toPay = await sdk.stakingMigration.getToPayByUser()
			return { toPay: toPay.toString(), wallet }
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch to pay', err)
			throw err
		}
	}
)

export const fetchEscrowMigratorAllowance = createAsyncThunk<
	{ escrowMigratorAllowance: string; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchEscrowMigratorAllowance', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const escrowMigratorAllowance = await sdk.stakingMigration.getEscrowMigratorAllowance()

		return {
			escrowMigratorAllowance: escrowMigratorAllowance.toString(),
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch escrow migrator allowance', err)
		throw err
	}
})

export const fetchTotalEscrowUnmigrated = createAsyncThunk<
	{ totalEscrowUnmigrated: string; wallet: string },
	void,
	ThunkConfig
>('stakingMigration/fetchTotalEscrowUnmigrated', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		if (!wallet) throw new Error('Wallet not connected')

		const totalEscrowUnmigrated = await sdk.stakingMigration.getTotalEscrowUnmigrated()

		return {
			totalEscrowUnmigrated: totalEscrowUnmigrated.toString(),
			wallet,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch total unmigrated escrow', err)
		throw err
	}
})

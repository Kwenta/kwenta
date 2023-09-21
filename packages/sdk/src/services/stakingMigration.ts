import { BigNumber } from '@ethersproject/bignumber'
import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { VESTING_ENTRY_PAGE_SIZE } from '../constants'
import { MigrationPeriod } from '../types/stakingMigration'

export default class stakingMigrationService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	public registerEntries(ids: number[]) {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.sdk.transactions.createContractTxn(EscrowMigrator, 'registerEntries', [ids])
	}

	public async approveKwentaTokenEscrowMigrator(user: string) {
		const { KwentaToken, EscrowMigrator } = this.sdk.context.contracts

		if (!KwentaToken || !EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const amount = await EscrowMigrator.toPay(user)
		return this.sdk.transactions.createContractTxn(KwentaToken, 'approve', [
			EscrowMigrator.address,
			amount,
		])
	}

	public migrateEntries(entryIDs: number[]) {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		return this.sdk.transactions.createContractTxn(EscrowMigrator, 'migrateEntries', [
			walletAddress,
			entryIDs,
		])
	}

	public getRegisteredVestingEntryIDs() {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		return EscrowMigrator.getRegisteredVestingEntryIDs(walletAddress, 0, VESTING_ENTRY_PAGE_SIZE)
	}

	public getRegisteredVestingSchedules() {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		return EscrowMigrator.getRegisteredVestingSchedules(walletAddress, 0, VESTING_ENTRY_PAGE_SIZE)
	}

	public async getVestingEntryIDs() {
		const { RewardEscrow } = this.sdk.context.contracts

		if (!RewardEscrow) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		const schedules = await RewardEscrow.getVestingSchedules(
			walletAddress,
			0,
			VESTING_ENTRY_PAGE_SIZE
		)

		return schedules
			.filter((schedule) => schedule.escrowAmount.gt(0))
			.map((schedule) => Number(schedule.entryID))
	}

	public getEscrowMigratorAllowance() {
		const { KwentaToken, EscrowMigrator } = this.sdk.context.contracts

		if (!KwentaToken || !EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		return KwentaToken.allowance(walletAddress, EscrowMigrator.address)
	}

	public getToPayByUser() {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context

		return EscrowMigrator.toPay(walletAddress)
	}

	public async getMigrationDeadline(): Promise<MigrationPeriod> {
		const { EscrowMigrator } = this.sdk.context.multicallContracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context
		const [startBN, duration]: BigNumber[] = await this.sdk.context.multicallProvider.all([
			EscrowMigrator.initializationTime(walletAddress),
			EscrowMigrator.MIGRATION_DEADLINE(),
		])
		return {
			startBN,
			endBN: startBN.add(duration),
		}
	}

	public getTotalEscrowUnmigrated() {
		const { EscrowMigrator } = this.sdk.context.contracts

		if (!EscrowMigrator) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		const { walletAddress } = this.sdk.context
		return EscrowMigrator.totalEscrowUnmigrated(walletAddress)
	}
}

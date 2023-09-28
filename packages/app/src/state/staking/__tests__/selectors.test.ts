import { toWei } from '@kwenta/sdk/utils'

import { selectInMigrationPeriod, selectStartMigration } from 'state/stakingMigration/selectors'

import {
	selectCanVestBeforeMigration,
	selectClaimableBalance,
	selectKwentaBalance,
	selectStakingMigrationRequired,
	selectStakingV1,
} from '../selectors'

describe('Staking Selectors', () => {
	let mockState: any

	beforeEach(() => {
		mockState = {
			wallet: {
				walletAddress: '0x123',
			},
			staking: {
				v1: {
					claimableBalance: '100',
					stakedKwentaBalance: '200',
					totalVestable: '300',
				},
				v2: {
					claimableBalance: '400',
					stakedKwentaBalance: '500',
					totalVestable: '600',
				},
				kwentaBalance: '700',
			},
			stakingMigration: {
				selectedUserMigrationInfo: {
					'0x123': {
						totalEscrowUnmigrated: '1000',
						migrationPeriod: {
							start: Math.floor(new Date('2023-01-01T12:00:00Z').getTime()),
							end: Math.floor(new Date('2023-01-14T12:00:00Z').getTime()),
						},
					},
				},
			},
		}
	})

	it('should select staking migration required correctly', () => {
		const result = selectStakingMigrationRequired(mockState)
		expect(result).toBeTruthy()
	})

	it('should select Kwenta balance correctly', () => {
		const result = selectKwentaBalance(mockState)
		expect(result).toEqual(toWei('700'))
	})

	it('should select claimable balance correctly', () => {
		const result = selectClaimableBalance(mockState)
		expect(result).toEqual(toWei('100'))
	})

	it('should select start migration correctly', () => {
		const result = selectStartMigration(mockState)
		expect(result).toBeTruthy()
	})

	it('should select in migration period as true when in migration period', () => {
		const result = selectInMigrationPeriod(mockState)
		expect(result).toBeTruthy()
	})

	it('should select can vest before migration correctly', () => {
		const result = selectCanVestBeforeMigration(mockState)
		expect(result).toBeFalsy()
	})

	it('should select staking V1 correctly with new selectors', () => {
		const result = selectStakingV1(mockState)
		expect(result).toBeTruthy()
	})
})

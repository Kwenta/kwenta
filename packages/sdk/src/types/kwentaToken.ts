import Wei from '@synthetixio/wei'

export type ClaimParams = [number, string, string, string[], number]

export type EpochData = {
	merkleRoot: string
	tokenTotal: string
	claims: {
		[address: string]: {
			index: number
			amount: string
			proof: string[]
		}
	}
	period: number
}

export type EscrowData<T = Wei> = {
	id: number
	date: string
	time: string
	vestable: T
	amount: T
	fee: T
	status: 'Vesting' | 'Vested'
	version: 1 | 2
}

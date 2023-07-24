type TPermitSingleMessage = {
	details: TPermitSingleDetails
	spender: string
	sigDeadline: number | string
}

type TPermitSingleDetails = {
	token: string
	amount: number | string
	expiration: number | string
	nonce: number | string
}

type TPermit2Domain = {
	name: string
	chainId: number
	verifyingContract: string
}

type TRSVResponse = {
	r: string
	s: string
	v: number
}

type PermitToken = {
	address: string
	chainId: number
	name: string
}

export type {
	TPermitSingleMessage,
	TPermitSingleDetails,
	TPermit2Domain,
	TRSVResponse,
	PermitToken,
}

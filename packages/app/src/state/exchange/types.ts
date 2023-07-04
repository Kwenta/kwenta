import { SynthSymbol } from '@kwenta/sdk/data'
import { SynthExchange, SynthSuspensionReason, Token } from '@kwenta/sdk/types'

import { FetchStatus } from 'state/types'

type ExchangeModal = 'settle' | 'confirm' | 'approve' | 'redeem' | 'base-select' | 'quote-select'

export type SwapRatio = 25 | 50 | 75 | 100

export type ExchangeState = {
	baseCurrencyKey?: string
	quoteCurrencyKey?: string
	txProvider?: 'synthetix' | '1inch' | 'synthswap'
	baseAmount: string
	quoteAmount: string
	ratio?: SwapRatio
	transactionFee?: string | null
	feeCost?: string
	slippagePercent?: string | null
	isSubmitting: boolean
	quotePriceRate?: string
	basePriceRate?: string
	baseFeeRate?: string
	exchangeFeeRate?: string
	rate?: string
	numEntries: number
	approvalStatus: FetchStatus
	tokenListStatus: FetchStatus
	synthsMap: any
	tokensMap: any
	tokenList: Token[]
	txHash?: string
	feeReclaimPeriod: number
	settlementWaitingPeriod: number
	openModal?: ExchangeModal
	oneInchQuote: string
	oneInchQuoteLoading: boolean
	oneInchQuoteError: boolean
	txError?: string
	isApproved?: boolean
	allowance?: string
	synthSuspensions: Record<
		SynthSymbol,
		{
			isSuspended: boolean
			reason: SynthSuspensionReason
			reasonCode: number
		}
	>
	walletTradesStatus: FetchStatus
	walletTrades: SynthExchange[]
}

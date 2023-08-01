import { wei } from '@synthetixio/wei'

import { MOCK_TRADE_PREVIEW, SDK_MARKETS } from '../../../testing/unit/mocks/data/futures'
import { mockTxResponse } from '../../../testing/unit/mocks/data/app'

export const mockSetProvider = () => Promise.resolve('10')
export const mockSetSigner = () => Promise.resolve()
export const mockSubmitCrossMarginOrder = jest.fn(() => ({ test: 'THE TX' }))

export const mockFuturesService = () => ({
	getSmartMarginAccounts: () => ['0x7bCe4eF9d95129011528E502357C7772'],
	getPreviousDayPrices: () => [],
	getSmartMarginTradePreview: () => {
		return { ...MOCK_TRADE_PREVIEW }
	},
	getFuturesPositions: () => [],
	getTradesForMarkets: () => [],
	getAllTrades: () => [],
	getConditionalOrders: () => [],
	getIsolatedMarginTransfers: () => [],
	getDelayedOrders: () => [],
	getSmartMarginTransfers: () => [],
	getSmartMarginBalanceInfo: () => ({
		freeMargin: wei('1000'),
		keeperEthBal: wei('0.1'),
		walletEthBal: wei('1'),
		allowance: wei('1000'),
	}),
	getMarkets: () => {
		return [...SDK_MARKETS]
	},
	submitCrossMarginOrder: mockSubmitCrossMarginOrder,
})

export const mockPerpsService = () => ({
	getSmartMarginAccounts: () => ['0x7bCe4eF9d95129011528E502357C7772'],
	getPreviousDayPrices: () => [],
	getSmartMarginTradePreview: () => {
		return { ...MOCK_TRADE_PREVIEW }
	},
	getFuturesPositions: () => [],
	getTradesForMarkets: () => [],
	getAllTrades: () => [],
	getConditionalOrders: () => [],
	getIsolatedMarginTransfers: () => [],
	getDelayedOrders: () => [],
	getSmartMarginTransfers: () => [],
	getSmartMarginBalanceInfo: () => ({
		freeMargin: wei('1000'),
		keeperEthBal: wei('0.1'),
		walletEthBal: wei('1'),
		allowance: wei('1000'),
	}),
	getMarkets: () => {
		return [...SDK_MARKETS]
	},
	submitCrossMarginOrder: mockSubmitCrossMarginOrder,
})

const mockSdk = {
	context: {},
	exchange: {},
	futures: { ...mockFuturesService() },
	prices: {},
	synths: {},
	transactions: {},
	kwentaToken: {
		getStakingV2Data: () => ({
			rewardEscrowBalance: wei(0),
			stakedNonEscrowedBalance: wei(0),
			stakedEscrowedBalance: wei(0),
			claimableBalance: wei(0),
			totalStakedBalance: wei(0),
			stakedResetTime: 100,
			kwentaStakingV2Allowance: wei(0),
		}),
	},
	system: {},
	perpsV3: {
		getMarkets: () => [],
		getPerpsV3AccountIds: () => [100],
		getAvailableMargin: () => wei(1000),
		getPendingAsyncOrders: () => [],
		createAccount: () => mockTxResponse('0x123'),
	},
	setProvider: mockSetProvider,
	setSigner: mockSetSigner,
}

export default mockSdk

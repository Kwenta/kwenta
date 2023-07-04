import { wei } from '@synthetixio/wei'

import { MOCK_TRADE_PREVIEW, SDK_MARKETS } from '../../../testing/unit/mocks/data/futures'

export const mockSetProvider = () => Promise.resolve('10')
export const mockSetSigner = () => Promise.resolve()
export const mockSubmitCrossMarginOrder = jest.fn(() => ({ test: 'THE TX' }))

const mockFuturesService = {
	getCrossMarginAccounts: () => ['0x7bCe4eF9d95129011528E502357C7772'],
	getPreviousDayPrices: () => [],
	getCrossMarginTradePreview: () => {
		return { ...MOCK_TRADE_PREVIEW }
	},
	getFuturesPositions: () => [],
	getTradesForMarkets: () => [],
	getAllTrades: () => [],
	getConditionalOrders: () => [],
	getIsolatedMarginTransfers: () => [],
	getDelayedOrders: () => [],
	getCrossMarginTransfers: () => [],
	getCrossMarginBalanceInfo: () => ({
		freeMargin: wei('1000'),
		keeperEthBal: wei('0.1'),
		walletEthBal: wei('1'),
		allowance: wei('1000'),
	}),
	getMarkets: () => {
		return [...SDK_MARKETS]
	},
	submitCrossMarginOrder: mockSubmitCrossMarginOrder,
}

const mockSdk = {
	context: {},
	exchange: {},
	futures: { ...mockFuturesService },
	prices: {},
	synths: {},
	transactions: {},
	kwentaToken: {},
	system: {},
	setProvider: mockSetProvider,
	setSigner: mockSetSigner,
}

export default mockSdk

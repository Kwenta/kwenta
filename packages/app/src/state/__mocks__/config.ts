import { MOCK_TRADE_PREVIEW, SDK_MARKETS } from '../../../testing/unit/mocks/data/futures'

// Import this named export into your test file:
export const mockSetProvider = () => Promise.resolve('10')
export const mockSetSigner = () => Promise.resolve()
export const mockSubmitCrossMarginOrder = jest.fn(() => ({ test: 'THE TX' }))

const mockFuturesService = {
	getCrossMarginAccounts: () => ['0x7bCe4eF9d95129011528E502357C7772'],
	// TODO: Mock rates for 24hr change
	getPreviousDayPrices: () => [],
	getCrossMarginTradePreview: () => {
		return { ...MOCK_TRADE_PREVIEW }
	},
	getFuturesPositions: () => [],
	getTradesForMarkets: () => [],
	getAllTrades: () => [],
	submitCrossMarginOrder: mockSubmitCrossMarginOrder,
	getMarkets: () => {
		return [...SDK_MARKETS]
	},
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

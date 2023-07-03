import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
jest.setTimeout(30000)

jest.mock('@rainbow-me/rainbowkit', () => ({
	wallet: {
		metaMask: () => {},
		rainbow: () => {},
		coinbase: () => {},
		walletConnect: () => {},
		ledger: () => {},
		brave: () => {},
		trust: () => {},
	},
	connectorsForWallets: () => {},
	useConnectModal: () => ({
		openConnectModal: () => {},
	}),
}))

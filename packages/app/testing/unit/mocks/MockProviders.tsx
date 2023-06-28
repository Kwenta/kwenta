import mockRouter from 'next-router-mock'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig } from 'wagmi'

import Connector from 'containers/Connector'
import { wagmiClient } from 'containers/Connector/config'
import { themes } from 'styles/theme'

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

jest.mock('next/router', () => require('next-router-mock'))
// This is needed for mocking 'next/link':
jest.mock('next/dist/client/router', () => require('next-router-mock'))

// TODO: Better mocking of requests, they are currently not getting
// picked up inside Refetch Context unless set here
jest.mock('axios', () => ({
	get: Promise.resolve(),
	post: Promise.resolve(),
}))

jest.mock('queries/futures/subgraph', () => ({
	__esModule: true,
	getFuturesTrades: () => Promise.resolve([]),
	getFuturesAggregateStats: () => Promise.resolve([]),
	getFuturesPositions: () => Promise.resolve([]),
}))

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
})

type Props = {
	children: ReactNode
	route?: string
}

process.env.GIT_HASH_ID = '12345'

const MockProviders = ({ children, route }: Props) => {
	mockRouter.setCurrentUrl(route || '/')

	return (
		<QueryClientProvider client={queryClient}>
			<WagmiConfig client={wagmiClient}>
				<Connector.Provider>
					<ThemeProvider theme={themes.dark}>{children}</ThemeProvider>
				</Connector.Provider>
			</WagmiConfig>
		</QueryClientProvider>
	)
}

export default MockProviders

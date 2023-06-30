import type { PreloadedState } from '@reduxjs/toolkit'
import i18n from 'i18n'
import mockRouter from 'next-router-mock'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { WagmiConfig } from 'wagmi'

import { wagmiClient } from 'containers/Connector/config'
import { AppStore, RootState, setupStore } from 'state/store'
import { themes } from 'styles/theme'

jest.mock('next/router', () => require('next-router-mock'))
// This is needed for mocking 'next/link':
jest.mock('next/dist/client/router', () => require('next-router-mock'))

// TODO: Better mocking of requests, they are currently not getting
// picked up inside Refetch Context unless set here
jest.mock('axios', () => ({
	get: Promise.resolve(),
	post: Promise.resolve(),
	create: jest.fn(),
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
	store?: AppStore
	preloadedState?: Partial<PreloadedState<RootState>>
}

process.env.GIT_HASH_ID = '12345'

const MockProviders = ({
	children,
	route,
	preloadedState,
	store = setupStore(preloadedState),
}: Props) => {
	mockRouter.setCurrentUrl(route || '/')

	return (
		<QueryClientProvider client={queryClient}>
			<I18nextProvider i18n={i18n}>
				<WagmiConfig client={wagmiClient}>
					<ReduxProvider store={store}>
						<ThemeProvider theme={themes.dark}>{children}</ThemeProvider>
					</ReduxProvider>
				</WagmiConfig>
			</I18nextProvider>
		</QueryClientProvider>
	)
}

export default MockProviders

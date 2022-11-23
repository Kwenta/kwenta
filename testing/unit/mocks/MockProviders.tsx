import { NetworkId } from '@synthetixio/contracts-interface';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import WithAppContainers from 'containers';
import mockRouter from 'next-router-mock';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from 'styled-components';
import { WagmiConfig } from 'wagmi';

import { wagmiClient } from 'containers/Connector/config';
import { RefetchProvider } from 'contexts/RefetchContext';
import { themes } from 'styles/theme';

import { DEFAULT_NETWORK } from '../constants';
import { mockProvider, MockEthProvider } from './mockEthersProvider';

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
}));

jest.mock('next/router', () => require('next-router-mock'));
// This is needed for mocking 'next/link':
jest.mock('next/dist/client/router', () => require('next-router-mock'));

// TODO: Better mocking of requests, they are currently not getting
// picked up inside Refetch Context unless set here
jest.mock('axios', () => ({
	get: Promise.resolve(),
	post: Promise.resolve(),
}));

jest.mock('queries/futures/subgraph', () => ({
	__esModule: true,
	getFuturesTrades: () => Promise.resolve([]),
	getFuturesAggregateStats: () => Promise.resolve([]),
	getFuturesPositions: () => Promise.resolve([]),
}));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

type Props = {
	children: ReactNode;
	ethProviderOverrides?: MockEthProvider;
	route?: string;
};

process.env.GIT_HASH_ID = '12345';

export const SynthetixProvider = ({ children, ethProviderOverrides }: Props) => {
	const mockedProvider = mockProvider(ethProviderOverrides);

	return (
		<SynthetixQueryContextProvider
			value={createQueryContext({
				// @ts-ignore
				provider: mockedProvider,
				networkId: DEFAULT_NETWORK.id as NetworkId,
				synthetixjs: null,
			})}
		>
			<RecoilRoot>{children}</RecoilRoot>
		</SynthetixQueryContextProvider>
	);
};

const MockProviders = ({ children, ethProviderOverrides, route }: Props) => {
	mockRouter.setCurrentUrl(route || '/');

	return (
		<QueryClientProvider client={queryClient}>
			<SynthetixProvider ethProviderOverrides={ethProviderOverrides}>
				<WagmiConfig client={wagmiClient}>
					<WithAppContainers>
						<RefetchProvider>
							<ThemeProvider theme={themes.dark}>{children}</ThemeProvider>
						</RefetchProvider>
					</WithAppContainers>
				</WagmiConfig>
			</SynthetixProvider>
		</QueryClientProvider>
	);
};

export default MockProviders;

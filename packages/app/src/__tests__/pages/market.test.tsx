import { NetworkId } from '@kwenta/sdk/dist/types'
import { fireEvent, render } from '@testing-library/react'
import { ReactNode } from 'react'

import { TEST_ADDR } from '../../../testing/unit/constants'
import { mockResizeObserver } from '../../../testing/unit/mocks/app'
import { mockUseWindowSize } from '../../../testing/unit/mocks/hooks'
import MockProviders from '../../../testing/unit/mocks/MockProviders'
import { mockReactQuery } from '../../../testing/unit/mocks/mockQueries'

import Market from '../../pages/market'
import mockConnector from '../../../testing/unit/mocks/mockConnector'
import { FUTURES_INITIAL_STATE } from '../../state/futures/reducer'
import { MOCK_SMART_MARGIN_ACCOUNT } from '../../../testing/unit/mocks/data/futures'
import { setupStore } from '../../state/store'
import { selectTradePreview } from '../../state/futures/selectors'
import { PricesInfoMap } from '../../state/prices/types'
import { PRICES_INITIAL_STATE } from '../../state/prices/reducer'

jest.mock('../../state/config')

jest.mock('../../queries/futures/useGetFuturesTrades', () => {
	return jest.fn(() => ({
		data: [],
		isLoading: false,
		fetchNextPage: () => {},
	}))
})

jest.mock('../../components/Media', (deviceType: 'mobile' | 'desktop' = 'desktop') => ({
	...jest.requireActual('../../components/Media'),
	DesktopOnlyView: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	MobileOnlyView: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const PRELOADED_STATE = {
	wallet: { networkId: 10 as NetworkId, walletAddress: TEST_ADDR },
	prices: {
		...PRICES_INITIAL_STATE,
		onChainPrices: { sETH: { price: '1810.50', change: 'up' } } as PricesInfoMap,
		offChainPrices: { sETH: { price: '1810.50', change: 'up' } } as PricesInfoMap,
	},
}

describe('Futures market page - smart margin', () => {
	beforeAll(() => {
		// TODO: remove this when we return to writing tests
		jest.spyOn(console, 'error').mockImplementation(() => {})
		mockUseWindowSize()
		mockReactQuery()
		mockResizeObserver()
		mockConnector()
	})

	test('Calculates correct fees from trade preview', async () => {
		const { findByTestId, findByText } = render(
			<MockProviders
				route="market/?accountType=cross_margin&asset=sETH"
				preloadedState={PRELOADED_STATE}
			>
				<Market />
			</MockProviders>
		)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()
	})

	test('Submits LONG order with correct desired fill price', async () => {
		const preLoadedState = {
			...PRELOADED_STATE,
			futures: {
				...FUTURES_INITIAL_STATE,
				crossMargin: {
					...FUTURES_INITIAL_STATE.crossMargin,
					accounts: {
						[10 as NetworkId]: {
							[TEST_ADDR]: MOCK_SMART_MARGIN_ACCOUNT,
						},
					},
				},
			},
		}
		const store = setupStore(preLoadedState)
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=cross_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()

		const submitButton = await findByTestId('trade-panel-submit-button')
		fireEvent.click(submitButton)

		const confirmButton = await findByTestId('trade-confirm-order-button')
		fireEvent.click(confirmButton)

		// Preview generated fill price displayed in confirmation view
		const fillPrice = await findByText('$1,847.76')
		expect(fillPrice).toBeTruthy()

		// Desired fill price is higher than fill price by 1%
		// (as a long order the price is worse to account for slippage in delayed order)
		expect(selectTradePreview(store.getState())?.desiredFillPrice.toString()).toBe(
			'1866.234411491951332934'
		)
	})

	test('Submits SHORT order with correct desired fill price', async () => {
		const preLoadedState = {
			...PRELOADED_STATE,
			futures: {
				...FUTURES_INITIAL_STATE,
				crossMargin: {
					...FUTURES_INITIAL_STATE.crossMargin,
					accounts: {
						[10 as NetworkId]: {
							[TEST_ADDR]: MOCK_SMART_MARGIN_ACCOUNT,
						},
					},
				},
			},
		}
		const store = setupStore(preLoadedState)
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=cross_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		const shortToggle = await findByTestId('position-side-short-button')
		fireEvent.click(shortToggle)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()

		const submitButton = await findByTestId('trade-panel-submit-button')
		fireEvent.click(submitButton)

		const confirmButton = await findByTestId('trade-confirm-order-button')
		fireEvent.click(confirmButton)

		// Preview generated fill price displayed in confirmation view
		const fillPrice = await findByText('$1,847.76')
		expect(fillPrice).toBeTruthy()

		// Desired fill price is lower than fill price by 1%
		// (as a short order the price is worse to account for slippage in delayed order)
		expect(selectTradePreview(store.getState())?.desiredFillPrice.toString()).toBe(
			'1829.279274630724573866'
		)
	})
})

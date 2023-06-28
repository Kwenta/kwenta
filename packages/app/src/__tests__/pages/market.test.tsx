import { FuturesMarket } from '@kwenta/sdk/dist/types'
import { wei } from '@synthetixio/wei'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { fetchMarkets } from 'state/futures/actions'

import { mockResizeObserver } from '../../../testing/unit/mocks/app'
import { PRELOADED_STATE } from '../../../testing/unit/mocks/data/app'
import {
	mockSmartMarginAccount,
	preloadedStateWithSmartMarginAccount,
	SDK_MARKETS,
} from '../../../testing/unit/mocks/data/futures'
import { mockUseWindowSize } from '../../../testing/unit/mocks/hooks'
import mockConnector from '../../../testing/unit/mocks/mockConnector'
import MockProviders from '../../../testing/unit/mocks/MockProviders'
import { mockReactQuery } from '../../../testing/unit/mocks/queries'
import Market from '../../pages/market'
import { selectTradePreview } from '../../state/futures/selectors'
import sdk from '../../state/sdk'
import { setupStore } from '../../state/store'

jest.mock('../../state/sdk')

jest.mock('../../queries/futures/useGetFuturesTrades', () => {
	return jest.fn(() => ({
		data: [],
		isLoading: false,
		fetchNextPage: () => {},
	}))
})

jest.mock('../../components/Media', () => ({
	...jest.requireActual('../../components/Media'),
	DesktopOnlyView: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	MobileOnlyView: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('Futures market page - smart margin', () => {
	beforeAll(() => {
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
		const store = setupStore(preloadedStateWithSmartMarginAccount())
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
		const store = setupStore(preloadedStateWithSmartMarginAccount())
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

	test('Displays error when trade exceeds max OI', async () => {
		// Update the mock to return some different data
		sdk.futures.getMarkets = () =>
			Promise.resolve([{ ...SDK_MARKETS[1], marketLimitUsd: wei(100000) } as FuturesMarket])

		const store = setupStore(
			preloadedStateWithSmartMarginAccount(mockSmartMarginAccount('1000000'))
		)
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=cross_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100000' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000000' } })

		// OI limit warning displayed
		const fillPrice = await findByText('Open interest limit exceeded')
		expect(fillPrice).toBeTruthy()
	})

	test('Trade panel is disabled when market is closed', async () => {
		sdk.futures.getMarkets = () => Promise.resolve([...SDK_MARKETS] as FuturesMarket[])
		const store = setupStore(preloadedStateWithSmartMarginAccount())
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
		expect(submitButton).toBeEnabled()

		sdk.futures.getMarkets = () =>
			Promise.resolve([{ ...SDK_MARKETS[1], isSuspended: true } as FuturesMarket])

		waitFor(() => store.dispatch(fetchMarkets()))

		const message = await findByText('Market suspended')
		expect(message).toBeTruthy()

		expect(submitButton).toBeDisabled()
	})
})

import { PerpsMarketV2, PositionSide } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { mockFuturesService } from 'state/__mocks__/sdk'
import { fetchMarkets } from 'state/futures/actions'
import { selectTradePreview } from 'state/futures/smartMargin/selectors'

import { mockResizeObserver } from '../../../testing/unit/mocks/app'
import { PRELOADED_STATE } from '../../../testing/unit/mocks/data/app'
import {
	MOCK_TRADE_PREVIEW,
	mockSmartMarginAccount,
	preloadedStateWithSmartMarginAccount,
	SDK_MARKETS,
} from '../../../testing/unit/mocks/data/futures'
import { mockUseWindowSize } from '../../../testing/unit/mocks/hooks'
import mockConnector from '../../../testing/unit/mocks/mockConnector'
import MockProviders from '../../../testing/unit/mocks/MockProviders'
import { mockReactQuery } from '../../../testing/unit/mocks/queries'
import Market from '../../pages/market'
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
		jest.setTimeout(60000)
		mockUseWindowSize()
		mockReactQuery()
		mockResizeObserver()
		mockConnector()
	})

	beforeEach(() => {
		// Reset the SDK mock
		// @ts-ignore
		sdk.futures = mockFuturesService()
	})

	test('Calculates correct fees from trade preview', async () => {
		const { findByTestId, findByText } = render(
			<MockProviders
				route="market/?accountType=smart_margin&asset=sETH"
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
		const { findByTestId, findByText, findAllByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
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

		// Preview generated fill price displayed in confirmation view and trade panel
		const fillPrice = await findAllByText('$1,847.76')
		expect(fillPrice.length).toEqual(2)

		// Desired fill price is higher than fill price by 1%
		// (as a long order the price is worse to account for slippage in delayed order)
		expect(selectTradePreview(store.getState())?.desiredFillPrice.toString()).toBe(
			'1866.234411491951332934'
		)
	})

	test('Submits SHORT order with correct desired fill price', async () => {
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText, findAllByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
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

		// Preview generated fill price displayed in confirmation view and trade panel
		const fillPrice = await findAllByText('$1,847.76')
		expect(fillPrice.length).toEqual(2)

		// Desired fill price is lower than fill price by 1%
		// (as a short order the price is worse to account for slippage in delayed order)
		expect(selectTradePreview(store.getState())?.desiredFillPrice.toString()).toBe(
			'1829.279274630724573866'
		)
	})

	test('Displays error when trade exceeds max OI', async () => {
		// Update the mock to return some different data
		sdk.futures.getMarkets = () =>
			Promise.resolve([{ ...SDK_MARKETS[1], marketLimitUsd: wei(100000) } as PerpsMarketV2])
		sdk.futures.getSmartMarginBalanceInfo = () =>
			Promise.resolve({
				freeMargin: wei('100000'),
				keeperEthBal: wei('0.1'),
				walletEthBal: wei('1'),
				allowance: wei('1000'),
			})

		const store = setupStore(preloadedStateWithSmartMarginAccount(mockSmartMarginAccount('100000')))
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
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
		sdk.futures.getMarkets = () => Promise.resolve([...SDK_MARKETS] as PerpsMarketV2[])
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
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
			Promise.resolve([{ ...SDK_MARKETS[1], isSuspended: true } as PerpsMarketV2])

		waitFor(() => store.dispatch(fetchMarkets()))

		const message = await findByText('Market suspended')
		expect(message).toBeTruthy()

		expect(submitButton).toBeDisabled()
	})
})

describe('Futures market page - stop loss validation', () => {
	beforeAll(() => {
		jest.setTimeout(60000)
		mockUseWindowSize()
		mockReactQuery()
		mockResizeObserver()
		mockConnector()
	})

	beforeEach(() => {
		// Reset the SDK mock
		// @ts-ignore
		sdk.futures = mockFuturesService()
	})

	test('Restricts stop loss for LONG trade at correct price depending on leverage', async () => {
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
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

		const expandButton = await findByTestId('expand-sl-tp-button')
		fireEvent.click(expandButton)

		const approveButton = await findByTestId('sl-tp-ack-proceed')
		fireEvent.click(approveButton)

		const stopLossInput = await findByTestId('trade-panel-stop-loss-input')
		fireEvent.change(stopLossInput, { target: { value: '1700' } })

		// Min / Max SL is shown when invalid
		const slMinMaxLabel = await findByText('Min: 1,735.52')
		expect(slMinMaxLabel).toBeTruthy()
		expect(submitButton).toBeDisabled()

		// Input valid when above min
		fireEvent.change(stopLossInput, { target: { value: '1750' } })
		expect(submitButton).toBeEnabled()
	})

	test('Restricts stop loss for SHORT trade at correct price depending on leverage', async () => {
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		sdk.futures.getSmartMarginTradePreview = () =>
			Promise.resolve({
				...MOCK_TRADE_PREVIEW,
				liqPrice: wei('2172.467580351348039045'),
				side: PositionSide.SHORT,
				size: wei('-0.541100000000000000'),
			})

		const shortToggle = await findByTestId('position-side-short-button')
		fireEvent.click(shortToggle)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()

		const submitButton = await findByTestId('trade-panel-submit-button')
		expect(submitButton).toBeEnabled()

		const expandButton = await findByTestId('expand-sl-tp-button')
		fireEvent.click(expandButton)

		const approveButton = await findByTestId('sl-tp-ack-proceed')
		fireEvent.click(approveButton)

		const stopLossInput = await findByTestId('trade-panel-stop-loss-input')
		fireEvent.change(stopLossInput, { target: { value: '2160' } })

		// Min / Max SL is shown when invalid
		// Liqudation price is 2,172.46 and stop is limited to 2,172.29
		const slMinMaxLabel = await findByText('Max: 2,107.29')
		expect(slMinMaxLabel).toBeTruthy()

		expect(submitButton).toBeDisabled()

		// Input valid when below max
		fireEvent.change(stopLossInput, { target: { value: '2099' } })
		expect(submitButton).toBeEnabled()
	})

	test('Stop loss becomes disabled above a certain leverage', async () => {
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		sdk.futures.getSmartMarginTradePreview = () =>
			Promise.resolve({
				...MOCK_TRADE_PREVIEW,
				liqPrice: wei('1795'),
				size: wei('1.1'),
				leverage: wei('40'),
			})

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '4000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()

		const submitButton = await findByTestId('trade-panel-submit-button')
		expect(submitButton).toBeEnabled()

		const expandButton = await findByTestId('expand-sl-tp-button')
		fireEvent.click(expandButton)

		const approveButton = await findByTestId('sl-tp-ack-proceed')
		fireEvent.click(approveButton)

		const stopLossInput = await findByTestId('trade-panel-stop-loss-input')

		await findByText('Leverage Too High')
		expect(stopLossInput).toBeDisabled()
	})

	test('Displays stop-loss warning in confirmation view when within 5% of liquidation price', async () => {
		const store = setupStore(preloadedStateWithSmartMarginAccount())
		const { findByTestId, findByText } = render(
			<MockProviders route="market/?accountType=smart_margin&asset=sETH" store={store}>
				<Market />
			</MockProviders>
		)

		sdk.futures.getSmartMarginTradePreview = () =>
			Promise.resolve({
				...MOCK_TRADE_PREVIEW,
				liqPrice: wei('2172.467580351348039045'),
				side: PositionSide.SHORT,
				size: wei('-0.5411'),
			})

		const shortToggle = await findByTestId('position-side-short-button')
		fireEvent.click(shortToggle)

		const marginInput = await findByTestId('set-order-margin-susd-desktop')
		fireEvent.change(marginInput, { target: { value: '100' } })

		const sizeInput = await findByTestId('set-order-size-amount-susd-desktop')
		fireEvent.change(sizeInput, { target: { value: '1000' } })

		const fees = await findByText('$1.69')
		expect(fees).toBeTruthy()

		const expandButton = await findByTestId('expand-sl-tp-button')
		fireEvent.click(expandButton)

		const approveButton = await findByTestId('sl-tp-ack-proceed')
		fireEvent.click(approveButton)

		const stopLossInput = await findByTestId('trade-panel-stop-loss-input')
		fireEvent.change(stopLossInput, { target: { value: '2090' } })

		const submitButton = await findByTestId('trade-panel-submit-button')
		fireEvent.click(submitButton)

		// Trade confirm button is disabled until the user acknowledges the warning
		const confirmButton = await findByTestId('trade-confirm-order-button')
		expect(confirmButton).toBeDisabled()

		const warningCheck = await findByTestId('sl-risk-warning')
		fireEvent.click(warningCheck)
		expect(confirmButton).toBeEnabled()
	})
})

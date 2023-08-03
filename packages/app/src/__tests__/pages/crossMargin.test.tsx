import { fireEvent, render } from '@testing-library/react'
import { ReactNode } from 'react'

import { mockFuturesService } from 'state/__mocks__/sdk'

import { mockResizeObserver } from '../../../testing/unit/mocks/app'
import { createState } from '../../../testing/unit/mocks/data/app'
import { mockUseWindowSize } from '../../../testing/unit/mocks/hooks'
import mockConnector from '../../../testing/unit/mocks/mockConnector'
import MockProviders from '../../../testing/unit/mocks/MockProviders'
import { mockReactQuery } from '../../../testing/unit/mocks/queries'
import Market from '../../pages/market'
import sdk from '../../state/sdk'

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

describe('Futures market page - cross margin', () => {
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

	test('Displays the correct trade panel', async () => {
		const { findByTestId } = render(
			<MockProviders
				route="market/?accountType=cross_margin&asset=sETH"
				preloadedState={createState(420)}
			>
				<Market />
			</MockProviders>
		)

		await findByTestId('cross-margin-trade-panel')
	})

	test('Can create a new cross margin account', async () => {
		sdk.perpsV3.getPerpsV3AccountIds = () => Promise.resolve([])

		const { findByTestId, findByText } = render(
			<MockProviders
				route="market/?accountType=cross_margin&asset=sETH"
				preloadedState={createState(420)}
			>
				<Market />
			</MockProviders>
		)

		const newAccountBtn = await findByTestId('create-cross-margin-account-button')
		fireEvent.click(newAccountBtn)

		sdk.perpsV3.getPerpsV3AccountIds = () => Promise.resolve([100])

		const submitButton = await findByText('Create Account')
		fireEvent.click(submitButton)

		// Users account has been created but there is no available margin
		await findByText('No available margin')
	})
})

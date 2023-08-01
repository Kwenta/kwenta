import { FuturesMarketKey } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'

import { setupStore } from 'state/store'

import {
	mockSmartMarginAccount,
	preloadedStateWithSmartMarginAccount,
} from '../../../../testing/unit/mocks/data/futures'
import { calculateCrossMarginFees, fetchMarkets } from '../actions'
import { PreviewAction } from '../types'

jest.mock('../../sdk')

describe('Futures actions - keeper deposits', () => {
	test('calculates correct ETH deposit when users has no existing balance', async () => {
		const mockAccount = mockSmartMarginAccount('1000', '0')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarkets())

		const orderParams = {
			market: {
				key: FuturesMarketKey.sETHPERP,
				address: '0x123',
			},
			orderPrice: wei(2000),
			sizeDelta: wei(10),
			marginDelta: wei(1000),
			action: 'trade' as PreviewAction,
		}
		store.dispatch(calculateCrossMarginFees(orderParams, 0))
		expect(Number(store.getState().futures.crossMargin.fees.keeperEthDeposit)).toEqual(0.01)
	})

	test('calculates correct ETH deposit when users has some existing orders and balance', async () => {
		const mockAccount = mockSmartMarginAccount('1000', '0.01')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarkets())

		const orderParams = {
			market: {
				key: FuturesMarketKey.sETHPERP,
				address: '0x123',
			},
			orderPrice: wei(2000),
			sizeDelta: wei(10),
			marginDelta: wei(1000),
			action: 'trade' as PreviewAction,
		}
		store.dispatch(calculateCrossMarginFees(orderParams, 5))
		expect(Number(store.getState().futures.crossMargin.fees.keeperEthDeposit)).toEqual(0.002)
	})

	test('requires no deposit when balance is enough', async () => {
		const mockAccount = mockSmartMarginAccount('1000', '0.01')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarkets())

		const orderParams = {
			market: {
				key: FuturesMarketKey.sETHPERP,
				address: '0x123',
			},
			orderPrice: wei(2000),
			sizeDelta: wei(10),
			marginDelta: wei(1000),
			action: 'trade' as PreviewAction,
		}
		store.dispatch(calculateCrossMarginFees(orderParams, 4))
		expect(Number(store.getState().futures.crossMargin.fees.keeperEthDeposit)).toEqual(0)
	})
})

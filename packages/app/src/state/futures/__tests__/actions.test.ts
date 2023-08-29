import { FuturesMarketKey } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'

import { setupStore } from 'state/store'

import {
	mockConditionalOrders,
	mockSmartMarginAccount,
	preloadedStateWithSmartMarginAccount,
} from '../../../../testing/unit/mocks/data/futures'
import sdk from '../../sdk'
import { PreviewAction } from '../common/types'
import {
	calculateSmartMarginFees,
	fetchMarketsV2,
	fetchSmartMarginOpenOrders,
} from '../smartMargin/actions'

jest.mock('../../sdk')

describe('Futures actions - keeper deposits', () => {
	test('calculates correct ETH deposit when users has no existing balance', async () => {
		const mockAccount = mockSmartMarginAccount('1000', '0')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarketsV2())

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
		store.dispatch(calculateSmartMarginFees(orderParams))
		expect(Number(store.getState().smartMargin.fees.keeperEthDeposit)).toEqual(0.01)
	})

	test('calculates correct ETH deposit for single order', async () => {
		sdk.futures.getConditionalOrders = () => Promise.resolve(mockConditionalOrders())

		const mockAccount = mockSmartMarginAccount('1000', '0.004')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarketsV2())
		await store.dispatch(fetchSmartMarginOpenOrders())

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
		store.dispatch(calculateSmartMarginFees(orderParams))

		// There are seven orders but we only need to cover 5 because a combined SL / TP would count as one.
		expect(Number(store.getState().smartMargin.fees.keeperEthDeposit)).toEqual(0.006)
	})

	test('calculates correct ETH deposit for new conditional order and SL / TP', async () => {
		sdk.futures.getConditionalOrders = () => Promise.resolve(mockConditionalOrders())

		const mockAccount = mockSmartMarginAccount('1000', '0.01')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarketsV2())
		await store.dispatch(fetchSmartMarginOpenOrders())

		const orderParams = {
			market: {
				key: FuturesMarketKey.sETHPERP,
				address: '0x123',
			},
			orderPrice: wei(2000),
			sizeDelta: wei(10),
			marginDelta: wei(1000),
			isConditional: true,
			hasStopOrTakeProfit: true,
			action: 'trade' as PreviewAction,
		}
		store.dispatch(calculateSmartMarginFees(orderParams))

		// There are seven orders but we only need to cover 5 because a combined SL / TP would count as one.
		expect(Number(store.getState().smartMargin.fees.keeperEthDeposit)).toEqual(0.001000000000000001)
		// TODO: Use bignumber / wei for accurate calc
	})

	test('requires no deposit when balance is enough', async () => {
		const mockAccount = mockSmartMarginAccount('1000', '0.01')
		const store = setupStore(preloadedStateWithSmartMarginAccount(mockAccount))
		await store.dispatch(fetchMarketsV2())

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
		store.dispatch(calculateSmartMarginFees(orderParams))
		expect(Number(store.getState().smartMargin.fees.keeperEthDeposit)).toEqual(0)
	})
})

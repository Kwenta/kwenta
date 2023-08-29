import { PositionSide } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'

import { furthestSLPrice } from 'utils/futures'

describe('futures utils', () => {
	test('correct stop loss limitation when LONG', () => {
		// Traders can place stop losses at 1% above liquidation price
		const minStopLoss = furthestSLPrice(wei(1800), PositionSide.LONG)
		expect(minStopLoss?.toNumber()).toEqual(1800)
	})

	test('correct stop loss limitation when SHORT', () => {
		// Traders can place stop losses at 1% below liquidation price
		const minStopLoss = furthestSLPrice(wei(2200), PositionSide.SHORT)
		expect(minStopLoss?.toNumber()).toEqual(2200)
	})
})

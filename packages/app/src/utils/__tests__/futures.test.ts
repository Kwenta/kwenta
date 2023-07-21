import { PositionSide } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'

import { minMaxSLPrice } from 'utils/futures'

describe('futures utils', () => {
	test('correct stop loss limitation when LONG', () => {
		// Traders can place stop losses at 3% above liquidation price
		const minStopLoss = minMaxSLPrice(wei(1800), PositionSide.LONG)
		expect(minStopLoss?.toNumber()).toEqual(1818)
	})

	test('correct stop loss limitation when SHORT', () => {
		// Traders can place stop losses at 3% below liquidation price
		const minStopLoss = minMaxSLPrice(wei(2200), PositionSide.SHORT)
		expect(minStopLoss?.toNumber()).toEqual(2178)
	})
})

import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarket } from '@kwenta/sdk/types'
import Wei, { wei } from '@synthetixio/wei'

export const computeDelayedOrderFee = (market: FuturesMarket | undefined, susdSizeDelta: Wei) => {
	if (
		!market?.marketSkew ||
		!market?.feeRates.takerFeeOffchainDelayedOrder ||
		!market?.feeRates.makerFeeOffchainDelayedOrder ||
		!susdSizeDelta
	) {
		return {
			commitDeposit: ZERO_WEI,
			delayedOrderFee: ZERO_WEI,
			makerFeeRate: ZERO_WEI,
			takerFeeRate: ZERO_WEI,
		}
	}

	const makerFeeRate = market.feeRates.makerFeeOffchainDelayedOrder
	const takerFeeRate = market.feeRates.takerFeeOffchainDelayedOrder
	const staticRate = sameSide(susdSizeDelta, market.marketSkew) ? takerFeeRate : makerFeeRate

	return {
		commitDeposit: susdSizeDelta.mul(staticRate).abs(),
		delayedOrderFee: susdSizeDelta.mul(staticRate).abs(),
		makerFeeRate,
		takerFeeRate,
	}
}

export const sameSide = (a: Wei, b: Wei) => {
	return a.gt(wei(0)) === b.gt(wei(0))
}

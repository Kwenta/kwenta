import Wei from '@synthetixio/wei'

import { useAppSelector } from 'state/hooks'
import { selectPreferredCurrency } from 'state/preferences/selectors'
import { selectPrices } from 'state/prices/selectors'

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useAppSelector(selectPreferredCurrency)
	const prices = useAppSelector(selectPrices)
	const selectPriceCurrencyRate = prices && prices[selectedPriceCurrency.name]?.onChain

	const getPriceAtCurrentRate = (price: Wei) =>
		selectPriceCurrencyRate ? price.div(selectPriceCurrencyRate) : price

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	}
}

export default useSelectedPriceCurrency

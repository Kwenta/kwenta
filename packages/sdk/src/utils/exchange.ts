import { FIAT_SYNTHS } from '../constants/number'
import { CurrencyKey } from '../types/common'
import { FuturesMarketKey } from '../types/futures'

export const synthToAsset = (currencyKey: CurrencyKey | FuturesMarketKey) => {
	return currencyKey.replace(/^(i|s)/, '')
}

export const isFiatCurrency = (currencyKey: CurrencyKey) => FIAT_SYNTHS.has(currencyKey)

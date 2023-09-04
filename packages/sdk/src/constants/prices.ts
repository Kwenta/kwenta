import { V2_MARKETS_LIST } from './futures'

export const PYTH_IDS = {
	mainnet: V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds!.mainnet) as string[],
	testnet: V2_MARKETS_LIST.filter((m) => !!m.pythIds).map((m) => m.pythIds!.testnet) as string[],
}

// Allow to be set from config so users can customise
export const PRICE_UPDATE_THROTTLE = 1000

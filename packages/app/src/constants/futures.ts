import { FuturesMarginType } from '@kwenta/sdk/types'

export const SUPPORTED_PERPS_TYPES =
	process.env.NODE_ENV === 'production'
		? [FuturesMarginType.SMART_MARGIN]
		: [FuturesMarginType.SMART_MARGIN, FuturesMarginType.CROSS_MARGIN]

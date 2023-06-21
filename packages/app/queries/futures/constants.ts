export const AGGREGATE_ASSET_KEY = '0x'

export const ORDER_PREVIEW_ERRORS = { insufficient_margin: 'Insufficient free margin' }
export const ORDER_PREVIEW_ERRORS_I18N: Record<string, string> = {
	insufficient_margin: 'futures.market.trade.preview.insufficient-margin',
	insufficient_margin_edit_leverage: 'futures.market.trade.edit-leverage.insufficient-margin',
	insufficient_free_margin_edit_leverage:
		'futures.market.trade.edit-leverage.insufficient-free-margin',
}

export const previewErrorI18n = (message: string) => {
	return ORDER_PREVIEW_ERRORS_I18N[message] || 'futures.market.trade.preview.error'
}

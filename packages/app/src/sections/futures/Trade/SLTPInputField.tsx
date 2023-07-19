import { PositionSide } from '@kwenta/sdk/types'
import { formatNumber } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { ChangeEvent, memo } from 'react'
import { useTranslation } from 'react-i18next'

import NumericInput from 'components/Input/NumericInput'
import { Body } from 'components/Text'

import ShowPercentage from './ShowPercentage'

export type SLTPInputFieldProps = {
	type: 'take-profit' | 'stop-loss'
	value: string
	invalid: boolean
	currentPrice: Wei
	leverage: Wei
	minMaxPrice?: Wei
	dataTestId?: string
	positionSide: PositionSide
	disabledReason?: string
	disabled?: boolean
	onChange: (_: ChangeEvent<HTMLInputElement>, v: string) => void
}

const SLTPInputField: React.FC<SLTPInputFieldProps> = memo(
	({
		type,
		value,
		invalid,
		currentPrice,
		minMaxPrice,
		positionSide,
		leverage,
		dataTestId,
		disabledReason,
		disabled,
		onChange,
	}) => {
		const { t } = useTranslation()

		return (
			<div style={{ marginTop: '5px', marginBottom: '10px' }}>
				<NumericInput
					invalid={invalid}
					dataTestId={dataTestId}
					value={value}
					onChange={(e, v) => {
						if (!disabled) onChange(e, v)
					}}
					disabled={disabled}
					placeholder={
						type === 'take-profit'
							? t('futures.market.trade.edit-sl-tp.no-tp')
							: t('futures.market.trade.edit-sl-tp.no-sl')
					}
					right={
						disabledReason || (invalid && minMaxPrice) ? (
							<Body color="negative">
								{disabledReason ??
									`${positionSide === PositionSide.LONG ? 'Min' : 'Max'}: ${formatNumber(
										minMaxPrice!.toString(),
										{ suggestDecimals: true }
									)}`}
							</Body>
						) : (
							<ShowPercentage
								targetPrice={value}
								isStopLoss={type === 'stop-loss'}
								currentPrice={currentPrice}
								leverageSide={positionSide}
								leverageWei={leverage}
							/>
						)
					}
				/>
			</div>
		)
	}
)

export default SLTPInputField

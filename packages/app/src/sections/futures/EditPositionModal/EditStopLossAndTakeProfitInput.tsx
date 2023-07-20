import { formatDollars } from '@kwenta/sdk/utils'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle from 'components/Input/InputTitle'

import SLTPInputField, { SLTPInputFieldProps } from '../Trade/SLTPInputField'

const EditStopLossAndTakeProfitInput: React.FC<SLTPInputFieldProps> = memo(
	({ type, currentPrice, ...props }) => {
		const { t } = useTranslation()

		return (
			<div style={{ marginTop: '5px', marginBottom: '10px' }}>
				<StyledInputHeaderRow
					label={type === 'take-profit' ? 'Take Profit' : 'Stop Loss'}
					rightElement={
						<StyledInputTitle>
							{t('futures.market.trade.edit-sl-tp.last-price')}:{' '}
							<span>{formatDollars(currentPrice)}</span>
						</StyledInputTitle>
					}
				/>

				<SLTPInputField
					{...props}
					type={'stop-loss'}
					currentPrice={currentPrice}
					dataTestId={'trade-panel-stop-loss-input'}
				/>
			</div>
		)
	}
)

const StyledInputHeaderRow = styled(InputHeaderRow)`
	margin-bottom: 9px;
`

const StyledInputTitle = styled(InputTitle)`
	span {
		font-family: ${(props) => props.theme.fonts.mono};
	}
`

export default EditStopLossAndTakeProfitInput

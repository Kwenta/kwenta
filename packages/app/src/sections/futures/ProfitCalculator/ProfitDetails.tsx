import { PositionSide } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Body } from 'components/Text'

function textColor(props: any) {
	if (!props.className || props.className === 'row-name')
		return props.theme.colors.selectedTheme.button.text.primary
	if (props.className === 'long') return props.theme.colors.selectedTheme.green
	if (props.className === 'short') return props.theme.colors.selectedTheme.red
	if (props.className === 'gray-font-color') return props.theme.colors.selectedTheme.gray
}

type ProfitDetailsProps = {
	stopLoss: string
	exitPrice: string
	marketName: string
	leverageSide: PositionSide
	marketAssetPositionSize: string
}

const ProfitDetails: React.FC<ProfitDetailsProps> = ({
	stopLoss,
	exitPrice,
	marketName,
	leverageSide,
	marketAssetPositionSize,
}) => {
	const { t } = useTranslation()

	const entryOrderDetails = leverageSide === PositionSide.LONG ? 'Long' : 'Short'

	return (
		<>
			<ProfitDetailsContainer>
				{/* ENTRY ORDER */}
				<ProfitDetailsRow>
					<RowText>
						{t('futures.modals.profit-calculator.profit-details.row-name.entry-price')}
					</RowText>
					<Details>
						<RowText className={leverageSide}>{`${entryOrderDetails}`}</RowText>
						<RowText style={{ marginLeft: '2px' }}>{`,`}</RowText>
						<RowText style={{ marginLeft: '10px' }}>
							{t('futures.modals.profit-calculator.profit-details.details.market')}
						</RowText>
					</Details>
				</ProfitDetailsRow>
				{/* TAKE PROFIT */}
				<ProfitDetailsRow>
					<RowText>
						{t('futures.modals.profit-calculator.profit-details.row-name.take-profit')}
					</RowText>
					<Details>
						<RowText>{t('futures.modals.profit-calculator.profit-details.details.sell')}</RowText>
						<RowText
							style={{ marginRight: '10px', marginLeft: '10px' }}
							className="gray-font-color"
						>
							{t('futures.modals.profit-calculator.profit-details.details.at')}
						</RowText>
						<RowText>{exitPrice !== '' ? '$' + wei(exitPrice).toNumber().toFixed(2) : ''}</RowText>
					</Details>
				</ProfitDetailsRow>
				{/* STOP LOSS */}
				<ProfitDetailsRow>
					<RowText>
						{t('futures.modals.profit-calculator.profit-details.row-name.stop-loss')}
					</RowText>
					<Details>
						<RowText>{t('futures.modals.profit-calculator.profit-details.details.sell')}</RowText>
						<RowText
							style={{ marginRight: '10px', marginLeft: '10px' }}
							className="gray-font-color"
						>
							{t('futures.modals.profit-calculator.profit-details.details.at')}
						</RowText>
						<RowText>{stopLoss !== '' ? '$' + wei(stopLoss).toNumber().toFixed(2) : ''}</RowText>
					</Details>
				</ProfitDetailsRow>
				{/* SIZE */}
				<ProfitDetailsRow>
					<RowText>{t('futures.modals.profit-calculator.profit-details.row-name.size')}</RowText>
					<Details>
						<RowText style={{ marginRight: '10px' }}>
							{marketAssetPositionSize !== ''
								? wei(marketAssetPositionSize).toNumber().toFixed(2)
								: ''}
						</RowText>
						<RowText className="gray-font-color">{marketName}</RowText>
					</Details>
				</ProfitDetailsRow>
			</ProfitDetailsContainer>
		</>
	)
}

const Details = styled.div``

const RowText = styled(Body).attrs({ size: 'small' })`
	display: inline-block;

	${(props) => css`
		color: ${textColor(props)};
		text-align: ${props.className === 'row-name' ? 'left' : 'right'};
	`}
`

const ProfitDetailsContainer = styled.div`
	margin-top: 20px;
	padding: 18px 20px;
	box-sizing: border-box;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 6px;
`

const ProfitDetailsRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	&:not(:first-of-type) {
		padding-top: 12px;
	}

	&:not(:last-of-type) {
		padding-bottom: 12px;
		border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	}
`

export default ProfitDetails

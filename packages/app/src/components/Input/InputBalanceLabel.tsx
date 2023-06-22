import { formatCurrency } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'

type Props = {
	balance: Wei
	currencyKey: string
	onSetAmount: (amount: string) => void
}

export default function InputBalanceLabel({ balance, currencyKey, onSetAmount }: Props) {
	const { t } = useTranslation()

	const key = currencyKey.toLowerCase()
	const isUsd = key === 'susd' || key === 'usd'
	return (
		<BalanceContainer>
			<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
			<BalanceButton as="button" onClick={() => onSetAmount(balance.toString())}>
				<span>
					{formatCurrency(currencyKey, balance, {
						sign: isUsd ? '$' : '',
						maxDecimals: isUsd ? 2 : undefined,
					})}
				</span>{' '}
				{currencyKey}
			</BalanceButton>
		</BalanceContainer>
	)
}

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
`

export const BalanceText = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export const BalanceButton = styled(BalanceText)`
	padding: 0;
	font-size: 12px;
	line-height: 11px;
	background-color: transparent;
	border: none;
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`

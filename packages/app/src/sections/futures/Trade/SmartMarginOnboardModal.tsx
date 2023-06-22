import { formatDollars } from '@kwenta/sdk/utils'
import dynamic from 'next/dynamic'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import { FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { selectSusdBalance } from 'state/balances/selectors'
import { useAppSelector } from 'state/hooks'

type Props = {
	onDismiss(): void
}

const SocketBridge = dynamic(() => import('../../../components/SocketBridge'), {
	ssr: false,
})

const SmartMarginOnboardModal: React.FC<Props> = memo(({ onDismiss }) => {
	const { t } = useTranslation()

	const susdBalance = useAppSelector(selectSusdBalance)

	return (
		<StyledBaseModal
			title={t('futures.market.trade.margin.modal.bridge.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<Disclaimer>{t('futures.market.trade.margin.modal.bridge.no-balance')}</Disclaimer>

			<Spacer height={10} />

			<SocketBridge />

			<Spacer height={20} />

			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(susdBalance)}</span> sUSD
				</BalanceText>
			</BalanceContainer>

			<MinimumAmountDisclaimer>
				{t('futures.market.trade.margin.modal.deposit.disclaimer')}
			</MinimumAmountDisclaimer>
		</StyledBaseModal>
	)
})

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
		margin-top: 5vh;
	}
`

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.selectedTheme.yellow : props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0 10px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`

const Disclaimer = styled.div`
	font-size: 12px;
	line-height: 120%;
	margin: 10px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: left;
`

export default SmartMarginOnboardModal

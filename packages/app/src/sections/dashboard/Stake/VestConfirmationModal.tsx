import { formatNumber } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import { FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { useAppSelector } from 'state/hooks'
import { selectIsVestingEscrowedRewards } from 'state/staking/selectors'
import { ExternalLink } from 'styles/common'

type Props = {
	onDismiss(): void
	totalFee: Wei
	handleVest(): void
}

const LinkText = () => {
	const { t } = useTranslation()

	return (
		<ExternalLink href={EXTERNAL_LINKS.Docs.Staking}>
			<b>{t('dashboard.stake.tabs.escrow.vest-modal.more-info')}</b>
		</ExternalLink>
	)
}

const VestConfirmationModal: FC<Props> = ({ onDismiss, totalFee, handleVest }) => {
	const { t } = useTranslation()
	const isVestingEscrowedRewards = useAppSelector(selectIsVestingEscrowedRewards)

	return (
		<StyledBaseModal
			title={t('dashboard.stake.tabs.escrow.vest-modal.title')}
			isOpen
			onDismiss={onDismiss}
		>
			<MinimumAmountDisclaimer>
				<Trans
					i18nKey="dashboard.stake.tabs.escrow.vest-modal.warning"
					components={[<LinkText />]}
				/>
			</MinimumAmountDisclaimer>

			<Spacer height={5} />

			<BalanceContainer>
				<BalanceText>
					<Trans
						i18nKey="dashboard.stake.tabs.escrow.vest-modal.confirm-text"
						values={{ totalFee: formatNumber(totalFee, { suggestDecimals: true }) }}
						components={[<b />]}
					/>
				</BalanceText>
			</BalanceContainer>

			<Spacer height={20} />

			<VestConfirmButton
				variant="flat"
				disabled={false}
				loading={isVestingEscrowedRewards}
				fullWidth
				onClick={handleVest}
			>
				{t('dashboard.stake.tabs.escrow.vest-modal.confirm-button')}
			</VestConfirmButton>
		</StyledBaseModal>
	)
}

const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`

const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
`

const BalanceText = styled(Body)`
	${(props) => css`
		color: ${props.theme.colors.selectedTheme.yellow};
		span {
			color: ${props.theme.colors.selectedTheme.button.text.primary};
		}
	`}
`

const VestConfirmButton = styled(Button)`
	height: 55px;
	color: ${(props) => props.theme.colors.selectedTheme.red};
`

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	margin: 20px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

export default VestConfirmationModal

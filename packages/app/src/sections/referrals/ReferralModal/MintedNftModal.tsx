import { formatPercent } from '@kwenta/sdk/utils'
import { FC, memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SuccessIcon from 'assets/svg/referrals/success.svg'
import Badge from 'components/Badge'
import Button from 'components/Button'
import { FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'

import { REFFERAL_TIERS } from '../constants'
import { ReferralTiers } from '../types'

type Props = {
	onDismiss(): void
	boostNftTier: ReferralTiers
}

export const MintedNftModal: FC<Props> = memo(({ onDismiss, boostNftTier }) => {
	const { t } = useTranslation()
	const { tier, boost } = REFFERAL_TIERS[boostNftTier]

	return (
		<FlexDivColCentered>
			<Spacer height={30} />
			<StyledSuccessIcon />
			<Spacer height={5} />
			<Heading variant="h4">{t('referrals.affiliates.modal.referrer.congratulations')}</Heading>
			<Spacer height={5} />
			<Body size="large" color="primary">
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.mint-message"
					components={[<Emphasis />]}
					values={{
						tier: ` ${t('referrals.affiliates.modal.nft-preview.tier-level')} ${tier + 1} `,
					}}
				/>
			</Body>
			<Spacer height={30} />
			<FlexDivColCentered>
				{REFFERAL_TIERS[boostNftTier].nftPreview}
				<BadgeContainer>
					<Badge color="yellow" dark={true}>
						{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${tier + 1}`}
					</Badge>
				</BadgeContainer>
			</FlexDivColCentered>
			<Spacer height={30} />
			<CenteredBody size="medium" color="primary">
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.earn-boost"
					components={[<Emphasis />]}
					values={{ boost: ` ${formatPercent(boost, { minDecimals: 0 })} ` }}
				/>
			</CenteredBody>
			<CenteredBody size="medium" color="primary">
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.stake-more"
					components={[<Emphasis />]}
				/>
			</CenteredBody>
			<Spacer height={30} />
			<Button
				data-testid="referrals.affiliates.modal.referrer.trade-now-button"
				variant="flat"
				disabled={false}
				loading={false}
				textTransform="none"
				fullWidth
				onClick={onDismiss}
			>
				<FlexDivRow columnGap="10px">
					{t('referrals.affiliates.modal.referrer.trade-now-button')}
				</FlexDivRow>
			</Button>
		</FlexDivColCentered>
	)
})

const BadgeContainer = styled.div`
	width: 50px;
	margin-top: -10px;
`

const CenteredBody = styled(Body)`
	text-align: center;
`

const StyledSuccessIcon = styled(SuccessIcon)`
	margin-top: -2px;
`

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.preview};
	white-space: pre-wrap;
`

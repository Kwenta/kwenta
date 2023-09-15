import { truncateAddress } from '@kwenta/sdk/utils'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Badge from 'components/Badge'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'

import { REFFERAL_TIERS } from '../constants'
import { ReferralTiers } from '../types'

type Props = {
	referralCode?: string
	boostNftTier: ReferralTiers
}

export const ReferralHeader: FC<Props> = memo(({ boostNftTier, referralCode }) => {
	const { t } = useTranslation()
	const displayReferralCode = useMemo(() => {
		if (!referralCode) return null
		if (referralCode.length < 13) return referralCode
		return truncateAddress(referralCode)
	}, [referralCode])

	return (
		<FlexDivCol>
			{t(REFFERAL_TIERS[boostNftTier].title)}
			<FlexDivRowCentered
				justifyContent="flex-start"
				columnGap={!!displayReferralCode ? '10px' : '0px'}
			>
				<Body mono size="xsmall" style={{ lineHeight: 1, textTransform: 'none' }}>
					{displayReferralCode}
				</Body>
				<Badge color="yellow" dark={true}>
					{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${
						REFFERAL_TIERS[boostNftTier].displayTier
					}`}
				</Badge>
			</FlexDivRowCentered>
		</FlexDivCol>
	)
})

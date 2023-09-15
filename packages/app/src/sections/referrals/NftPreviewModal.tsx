import { formatPercent } from '@kwenta/sdk/utils'
import Image from 'next/image'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LinkIconLight from 'assets/svg/app/link-light.svg'
import Badge from 'components/Badge'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import useWindowSize from 'hooks/useWindowSize'
import { useAppSelector } from 'state/hooks'
import { selectReferralNft } from 'state/referrals/selectors'

import { REFFERAL_TIERS } from './constants'

type NftPreviewModalProps = {
	onDismiss(): void
}

type NftHeaderProps = {
	title: string
	tier: number
}
export const NftHeader: FC<NftHeaderProps> = memo(({ title, tier }) => {
	const { t } = useTranslation()
	return (
		<FlexDivCol rowGap="5px">
			{t(title)}
			<Badge color="yellow">{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${
				tier + 1
			}`}</Badge>
		</FlexDivCol>
	)
})

const NftPreviewModal: FC<NftPreviewModalProps> = memo(({ onDismiss }) => {
	const { t } = useTranslation()
	const nftTier = useAppSelector(selectReferralNft)
	const { boost, title, icon, animationUrl, tier } = REFFERAL_TIERS[nftTier]
	const { deviceType } = useWindowSize()
	const imageSize = useMemo(() => (deviceType === 'mobile' ? 330 : 355), [deviceType])

	return (
		<StyledBaseModal title={<NftHeader title={title} tier={tier} />} isOpen onDismiss={onDismiss}>
			<Spacer height={30} />
			<StyledImage
				src={animationUrl}
				width={imageSize}
				height={imageSize}
				alt="bronze"
				loading="lazy"
			/>
			<Spacer height={30} />
			<ProfileContainer columnGap="20px" justifyContent="flex-start">
				<ProfileItemContainer columnGap="20px">
					<IconContainer>{icon}</IconContainer>
					<LabelContainer rowGap="2px" justifyContent="space-between" marginRight="10px">
						<Body size="large" color="primary">
							{t('referrals.affiliates.modal.nft-preview.nft-tier')}
						</Body>
						<Body size="large" color="preview">
							{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${tier + 1}`}
						</Body>
					</LabelContainer>
				</ProfileItemContainer>
				<Body size="large" color="secondary">
					|
				</Body>
				<ProfileItemContainer columnGap="20px">
					<LabelContainer rowGap="2px" justifyContent="space-between" marginLeft="20px">
						<Body size="large" color="primary">
							{t('referrals.traders.dashboard.rewards-boost')}
						</Body>
						<Body size="large" color="preview">
							{formatPercent(boost, { minDecimals: 0 })}
						</Body>
					</LabelContainer>
				</ProfileItemContainer>
			</ProfileContainer>
			<Spacer height={30} />
			<Button
				data-testid="referrals.affiliates.modal.nft-preview.view-button"
				variant="flat"
				disabled={false}
				loading={false}
				textTransform="none"
				fullWidth
				onClick={() => window.open(EXTERNAL_LINKS.Referrals.BoostNFT, '_blank')}
			>
				<FlexDivRow columnGap="10px">
					{t('referrals.affiliates.modal.nft-preview.view-button')}
					<LinkIconLight height={18} />
				</FlexDivRow>
			</Button>
		</StyledBaseModal>
	)
})

const StyledImage = styled(Image)`
	border-radius: 20px;
	margin: 0 auto;
`

const LabelContainer = styled(FlexDivCol)<{
	justifyContent?: string
	marginRight?: string
	marginLeft?: string
}>`
	justify-content: ${(props) => props.justifyContent || 'flex-start'};
	margin-right: ${(props) => props.marginRight || 'initial'};
	margin-left: ${(props) => props.marginLeft || 'initial'};
`

const IconContainer = styled.div`
	svg {
		width: 48px;
		height: 48px;
	}
`
const ProfileItemContainer = styled(FlexDivRowCentered)`
	height: 56px;
`

const ProfileContainer = styled(FlexDivRowCentered)`
	margin-bottom: 0px;
	border-radius: 20px;
	border: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.border};
	padding: 20px;
`
const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
	.card-header {
		margin-top: 15px;
	}
`

export default NftPreviewModal

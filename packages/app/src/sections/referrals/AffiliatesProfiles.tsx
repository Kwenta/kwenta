import { formatPercent } from '@kwenta/sdk/utils'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import MobileGridSvg from 'assets/svg/referrals/profile-background-mobile.svg'
import GridSvg from 'assets/svg/referrals/profile-background.svg'
import Button from 'components/Button'
import {
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	FlexDivRowCentered,
} from 'components/layout/flex'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { Body } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import useWindowSize from 'hooks/useWindowSize'
import { useAppSelector } from 'state/hooks'
import { selectReferralCodes, selectReferralNft } from 'state/referrals/selectors'
import media from 'styles/media'

import { REFERRAL_TIERS_ARRAY, REFFERAL_TIERS } from './constants'
import NftPreviewModal from './NftPreviewModal'
import ReferralTiersProgressBar from './ReferralTiersProgressBar'

const AffiliatesProfiles = memo(() => {
	const { t } = useTranslation()
	const tier = useAppSelector(selectReferralNft)
	const mockReferralsRewards = useAppSelector(selectReferralCodes)
	const referredCount = mockReferralsRewards.reduce(
		(acc, { referredCount }) => acc + Number(referredCount),
		0
	)
	const { lessThanWidth } = useWindowSize()
	const { icon, title, boost, nftPreview } = REFFERAL_TIERS[tier === -1 ? 0 : tier]
	const [nftPreviewModalOpen, setNftPreviewModalOpen] = useState(false)
	const handleOpenModal = useCallback(() => setNftPreviewModalOpen(true), [])
	const handleDismissModal = useCallback(() => setNftPreviewModalOpen(false), [])

	return (
		<Container>
			<DesktopOnlyView>
				<CardsContainer>
					<SvgContainer>
						<GridSvg objectFit="cover" objectPosition="center" layout="fill" />
					</SvgContainer>
					<ContentContainer>
						<StyledFlexDivRowCentered justifyContent="space-between" zIndex="2">
							<FlexDivRowCentered columnGap="25px">
								{icon}
								<FlexDivCol>
									<Body size="large">{t(title)} NFT</Body>
									<Body size="large" color="preview">
										{`${formatPercent(boost, { maxDecimals: 0 })} ${t(
											'referrals.affiliates.nft.boost'
										)}`}
									</Body>
								</FlexDivCol>
							</FlexDivRowCentered>
							<Button
								size="xsmall"
								isRounded
								onClick={() => window.open(EXTERNAL_LINKS.Docs.Referrals, '_blank')}
							>
								{t('referrals.affiliates.view-all-rates')}
							</Button>
						</StyledFlexDivRowCentered>
						<StyledFlexDivRowCentered
							columnGap="60px"
							justifyContent="space-between"
							marginBottom="20px"
						>
							<StyledFlexDivCol rowGap="15px" justifyContent="flex-start" width="70%">
								<StyledFlexDivRow columnGap="20px" justifyContent="flex-start" marginBottom="0px">
									<FlexDivCol rowGap="5px">
										<Body size="large" color="secondary">
											{t('referrals.affiliates.dashboard.traders-referred')}
										</Body>
										<Body size="large" color="preview">
											{referredCount}
										</Body>
									</FlexDivCol>
									<Body size="large" color="secondary">
										|
									</Body>
									<FlexDivCol rowGap="5px">
										<Body size="large" color="secondary">
											{t('referrals.traders.dashboard.rewards-boost')}
										</Body>
										<Body size="large" color="preview">
											{formatPercent(boost, { maxDecimals: 0 })}
										</Body>
									</FlexDivCol>
								</StyledFlexDivRow>
								<ReferralTiersProgressBar referralTiersDef={REFERRAL_TIERS_ARRAY} />
							</StyledFlexDivCol>
							<ImageContainer onClick={handleOpenModal}>
								{nftPreview}
								<Overlay className="overlay">
									<PreviewText>{t('referrals.affiliates.nft.preview')}</PreviewText>
								</Overlay>
							</ImageContainer>
						</StyledFlexDivRowCentered>
					</ContentContainer>
				</CardsContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<CardsContainer>
					<SvgContainer>
						{lessThanWidth('lg') ? (
							<MobileGridSvg objectFit="cover" objectPosition="center" layout="fill" />
						) : (
							<GridSvg objectFit="cover" objectPosition="center" layout="fill" />
						)}
					</SvgContainer>
					<ContentContainer>
						<StyledFlexDivRowCentered justifyContent="space-between" zIndex="2">
							<FlexDivRowCentered columnGap="20px">
								{icon}
								<FlexDivCol>
									<Body size="large">{t(title)} NFT</Body>
									<Body size="large" color="preview">
										{`${formatPercent(boost, { maxDecimals: 0 })} ${t(
											'referrals.affiliates.nft.boost'
										)}`}
									</Body>
								</FlexDivCol>
							</FlexDivRowCentered>
							<Button
								size="xsmall"
								isRounded
								onClick={() => window.open(EXTERNAL_LINKS.Docs.Referrals, '_blank')}
							>
								{t('referrals.affiliates.rates')}
							</Button>
						</StyledFlexDivRowCentered>
						<StyledFlexDivCol rowGap="25px" marginTop="10px">
							<InfoContainer>
								<FlexDivCol rowGap="5px">
									<Body size="large" color="secondary">
										{t('referrals.affiliates.dashboard.traders-referred')}
									</Body>
									<Body size="large" color="preview">
										{referredCount}
									</Body>
								</FlexDivCol>
								<Body size="large" color="secondary">
									|
								</Body>
								<FlexDivCol rowGap="5px">
									<Body size="large" color="secondary">
										{t('referrals.traders.dashboard.rewards-boost')}
									</Body>
									<Body size="large" color="preview">
										{formatPercent(boost, { maxDecimals: 0 })}
									</Body>
								</FlexDivCol>
							</InfoContainer>
							<ImageContainer onClick={handleOpenModal}>
								{nftPreview}
								<Overlay className="overlay">
									<PreviewText>{t('referrals.affiliates.nft.preview')}</PreviewText>
								</Overlay>
							</ImageContainer>
							<BarContainer>
								<ReferralTiersProgressBar referralTiersDef={REFERRAL_TIERS_ARRAY} />
							</BarContainer>
						</StyledFlexDivCol>
					</ContentContainer>
				</CardsContainer>
			</MobileOrTabletView>
			{nftPreviewModalOpen && <NftPreviewModal onDismiss={handleDismissModal} />}
		</Container>
	)
})

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)<{
	marginBottom?: string
	zIndex?: string
}>`
	width: 100%;
	margin-bottom: ${(props) => props.marginBottom || 'initial'};
	z-index: ${(props) => props.zIndex || 'initial'};
`

const StyledFlexDivCol = styled(FlexDivCol)<{
	marginTop?: string
	width?: string
	justifyContent?: string
}>`
	width: ${(props) => props.width || '100%'};
	margin-top: ${(props) => props.marginTop || 'initial'};
	justify-content: ${(props) => props.justifyContent || 'initial'};
`

const StyledFlexDivRow = styled(FlexDivRow)<{
	marginBottom?: string
	width?: string
}>`
	width: ${(props) => props.width || '100%'};
	margin-bottom: ${(props) => props.marginBottom || 'initial'};
`

const BarContainer = styled.div`
	margin-bottom: 20px;
`

const SvgContainer = styled.div`
	position: absolute;
	overflow: hidden;
	width: 100%;
	height: 88px;
	z-index: 1;
	svg {
		width: 100%;
		height: auto;
	}
`
const InfoContainer = styled(FlexDivRow)`
	justify-content: flex-start;
	padding-right: 10px;
	padding-top: 10px;
	column-gap: 25px;
	${media.lessThan('sm')`
		column-gap: 0px;
		justify-content: space-between;
	`}
`
const ImageContainer = styled.div`
	position: relative;
	overflow: hidden;
	margin-top: 20px;
	svg {
		cursor: pointer;
	}

	&:hover .overlay {
		opacity: 1;
	}

	${media.lessThan('lg')`
		margin-top: 0px;
		display: flex;
		justify-content: center;
		align-items: center;
	`}
`

const PreviewText = styled.div`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	padding: 10px 15px;
	border: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.border};
	border-radius: 100px;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.black};
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
`

const Overlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin-bottom: 2px;
	border-radius: 20px;
	background: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.primary.overlay.background};
	opacity: 0;
	transition: opacity 0.3s ease;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	${media.lessThan('lg')`
		width: 244px;
		margin: auto
	`}
`

const Container = styled.div`
	position: relative;
	margin-top: 25px;
	width: 100%;
	height: 100%;
	border-radius: 20px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
`

const CardsContainer = styled.div`
	position: relative;
	margin-top: 0;
`

const ContentContainer = styled(FlexDivColCentered)`
	padding: 24px 25px;
	width: 100%;
	justify-content: flex-start;
	column-gap: 50px;
	row-gap: 25px;
	flex-flow: row wrap;
`

export default AffiliatesProfiles

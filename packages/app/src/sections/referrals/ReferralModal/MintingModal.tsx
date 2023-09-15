import { formatPercent } from '@kwenta/sdk/utils'
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, memo, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import MintingIcon from 'assets/svg/referrals/minting.svg'
import ReferralsIcon from 'assets/svg/referrals/referrals.svg'
import Badge from 'components/Badge'
import Button from 'components/Button'
import { FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import Loader from 'components/Loader'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import useIsL2 from 'hooks/useIsL2'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { mintBoostNft } from 'state/referrals/action'
import { selectIsMintingBoostNft } from 'state/referrals/selectors'
import { selectWallet } from 'state/wallet/selectors'

import { REFFERAL_TIERS } from '../constants'
import { ReferralTiers } from '../types'

type Props = {
	referralCode: string
	boostNftTier: ReferralTiers
}

export const MintingModal: FC<Props> = memo(({ referralCode, boostNftTier }) => {
	const { t } = useTranslation()
	const { openChainModal } = useChainModal()
	const { openConnectModal } = useConnectModal()
	const isL2 = useIsL2()
	const wallet = useAppSelector(selectWallet)
	const dispatch = useAppDispatch()
	const isMinting = useAppSelector(selectIsMintingBoostNft)

	const boost = REFFERAL_TIERS[boostNftTier].boost

	const handleMintBoostNft = useCallback(() => {
		dispatch(mintBoostNft(referralCode))
	}, [dispatch, referralCode])

	return (
		<FlexDivColCentered>
			<Spacer height={30} />
			<ReferralsIcon width={60} height={60} />
			<Spacer height={5} />
			<Heading variant="h4">{t('referrals.affiliates.modal.referrer.welcome-message')}</Heading>
			<Spacer height={5} />
			<Badge color="primary" dark={true} font="regular" textTransform={false}>
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.badge-copy"
					components={[<Emphasis />]}
					values={{ boost: ` ${formatPercent(boost, { minDecimals: 0 })} ` }}
				/>
			</Badge>
			<Spacer height={25} />
			<FlexDivColCentered>
				{isMinting ? (
					<>
						<MintingIcon width={240} height={240} />
						<Loader width="60px" height="60px" />
						<BadgeContainer>
							<Badge color="yellow" dark={true}>
								{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${
									REFFERAL_TIERS[boostNftTier].displayTier
								}`}
							</Badge>
						</BadgeContainer>
					</>
				) : (
					<>
						{REFFERAL_TIERS[boostNftTier].nftPreview}
						<BadgeContainer>
							<Badge color="yellow" dark={true}>
								{`${t('referrals.affiliates.modal.nft-preview.tier-level')} ${
									REFFERAL_TIERS[boostNftTier].displayTier
								}`}
							</Badge>
						</BadgeContainer>
					</>
				)}
			</FlexDivColCentered>
			<Spacer height={30} />
			<Button
				data-testid="referrals.affiliates.modal.referrer.boost-button"
				variant="flat"
				disabled={false}
				loading={isMinting}
				textTransform="none"
				fullWidth
				onClick={wallet ? (isL2 ? handleMintBoostNft : openChainModal) : openConnectModal}
			>
				<FlexDivRow columnGap="10px">
					{wallet
						? isL2
							? t('referrals.affiliates.modal.referrer.boost-button')
							: t('homepage.l2.cta-buttons.switch-l2')
						: t('common.wallet.connect-wallet')}
				</FlexDivRow>
			</Button>
			<Spacer height={30} />
			<CenteredBody size="medium" color="secondary">
				{t('referrals.affiliates.modal.referrer.learn-more')}
			</CenteredBody>
			<CenteredBody
				size="medium"
				color="primary"
				cursor="pointer"
				onClick={() => window.open(EXTERNAL_LINKS.Docs.Referrals, '_blank')}
			>
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.referral-program"
					components={[<Underline />]}
				/>
			</CenteredBody>
		</FlexDivColCentered>
	)
})

const BadgeContainer = styled.div`
	width: 50px;
	margin-top: -10px;
`

const CenteredBody = styled(Body)<{ cursor?: string }>`
	text-align: center;
	cursor: ${(props) => props.cursor || 'default'};
`

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.preview};
	white-space: pre-wrap;
`

const Underline = styled(Emphasis)`
	text-decoration: underline;
`

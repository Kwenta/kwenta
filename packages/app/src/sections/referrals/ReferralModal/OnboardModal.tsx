import { formatPercent } from '@kwenta/sdk/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { FC, memo, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DeepLiquidityIcon from 'assets/svg/referrals/deep-liquidity.svg'
import LowFeesIcon from 'assets/svg/referrals/low-fees.svg'
import ReferralsIcon from 'assets/svg/referrals/referrals.svg'
import TradingRewardsIcon from 'assets/svg/referrals/trading-rewards.svg'
import Badge from 'components/Badge'
import Button from 'components/Button'
import {
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRow,
	FlexDivRowCentered,
} from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setStartOnboarding } from 'state/referrals/reducer'
import { selectCheckSelfReferred } from 'state/referrals/selectors'
import { selectWallet } from 'state/wallet/selectors'

import { REFFERAL_TIERS } from '../constants'
import { ReferralTiers } from '../types'

type Props = {
	boostNftTier: ReferralTiers
}

export const OnboardModal: FC<Props> = memo(({ boostNftTier }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const { openConnectModal } = useConnectModal()
	const boost = REFFERAL_TIERS[boostNftTier].boost
	const isSelfReferred = useAppSelector(selectCheckSelfReferred)

	const handleStart = useCallback(() => {
		if (wallet) {
			dispatch(setStartOnboarding(true))
		} else {
			openConnectModal?.()
		}
	}, [dispatch, openConnectModal, wallet])

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
			<Spacer height={30} />
			<FlexDivCol rowGap="30px">
				<FlexDivRowCentered columnGap="20px" justifyContent="flex-start">
					<IconContainer>
						<LowFeesIcon />
					</IconContainer>
					<FeatureItemContainer rowGap="5px">
						<Body size="large" color="primary" weight="bold">
							{t('referrals.affiliates.modal.referrer.low-fees.title')}
						</Body>
						<Body size="medium" color="secondary">
							{t('referrals.affiliates.modal.referrer.low-fees.copy')}
						</Body>
					</FeatureItemContainer>
				</FlexDivRowCentered>
				<FlexDivRowCentered columnGap="20px" justifyContent="flex-start">
					<DeepLiquidityIcon />
					<FeatureItemContainer rowGap="5px">
						<Body size="large" color="primary" weight="bold">
							{t('referrals.affiliates.modal.referrer.deep-liquidity.title')}
						</Body>
						<Body size="medium" color="secondary">
							{t('referrals.affiliates.modal.referrer.deep-liquidity.copy')}
						</Body>
					</FeatureItemContainer>
				</FlexDivRowCentered>
				<FlexDivRowCentered columnGap="20px" justifyContent="flex-start">
					<TradingRewardsIcon />
					<FeatureItemContainer rowGap="5px">
						<Body size="large" color="primary" weight="bold">
							{t('referrals.affiliates.modal.referrer.trading-rewards.title')}
						</Body>
						<Body size="medium" color="secondary">
							{t('referrals.affiliates.modal.referrer.trading-rewards.copy')}
						</Body>
					</FeatureItemContainer>
				</FlexDivRowCentered>
			</FlexDivCol>
			<Spacer height={30} />
			<Button
				data-testid="referrals.affiliates.modal.referrer.get-started-button"
				variant={isSelfReferred ? 'danger' : 'flat'}
				disabled={isSelfReferred}
				loading={false}
				textTransform="none"
				fullWidth
				onClick={handleStart}
			>
				<FlexDivRow columnGap="10px">
					{wallet
						? isSelfReferred
							? t('referrals.affiliates.modal.referrer.no-self-referred')
							: t('referrals.affiliates.modal.referrer.get-started-button')
						: t('common.wallet.connect-wallet')}
				</FlexDivRow>
			</Button>
			<Spacer height={30} />
			<CenteredBody size="medium" color="secondary">
				{t('referrals.affiliates.modal.referrer.learn-more')}
			</CenteredBody>
			<Body
				size="medium"
				color="primary"
				style={{ textAlign: 'center', cursor: 'pointer' }}
				onClick={() => window.open(EXTERNAL_LINKS.Docs.Referrals, '_blank')}
			>
				<Trans
					i18nKey="referrals.affiliates.modal.referrer.referral-program"
					components={[<Underline />]}
				/>
			</Body>
		</FlexDivColCentered>
	)
})

const CenteredBody = styled(Body)`
	text-align: center;
`

const FeatureItemContainer = styled(FlexDivCol)`
	width: 70%;
`
const IconContainer = styled.div`
	width: 60px;
`

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.preview};
	white-space: pre-wrap;
`

const Underline = styled(Emphasis)`
	text-decoration: underline;
`

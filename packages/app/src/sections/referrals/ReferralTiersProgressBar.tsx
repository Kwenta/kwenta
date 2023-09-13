import { formatPercent } from '@kwenta/sdk/utils'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InactiveTierIcon from 'assets/svg/referrals/inactive-tier.svg'
import { FlexDivCol, FlexDivColCentered, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import { useAppSelector } from 'state/hooks'
import { selectReferralNft, selectReferralScore } from 'state/referrals/selectors'

import { MAX_REFERRAL_SCORE, REFFERAL_TIERS } from './constants'
import { ReferralTierDetails, ReferralTiers } from './types'

type ReferralTiersProgressBarProps = {
	referralTiersDef: ReferralTierDetails[]
}

const ReferralTiersProgressBar: FC<ReferralTiersProgressBarProps> = memo(({ referralTiersDef }) => {
	const { t } = useTranslation()
	const referralNftTier = useAppSelector(selectReferralNft)
	const score = useAppSelector(selectReferralScore)
	const ratio = useMemo(() => score / MAX_REFERRAL_SCORE, [score])

	return (
		<FlexDivCol>
			<FlexDivRowCentered justifyContent="space-between">
				{referralTiersDef
					.filter(({ tier }) => tier >= 0)
					.map(({ title, tier, displayTier, icon }) => (
						<FlexDivColCentered key={tier} rowGap="10px">
							{referralNftTier === tier ? (
								icon
							) : (
								<InactiveTierIconContainer justifyContent="Center">
									<InactiveTierIcon />
									<CenteredNumber
										mono
										color={`${referralNftTier >= tier ? 'primary' : 'secondary'}`}
									>
										{displayTier}
									</CenteredNumber>
								</InactiveTierIconContainer>
							)}
							<Body size="large" weight="bold">
								{t(title)}
							</Body>
						</FlexDivColCentered>
					))}
			</FlexDivRowCentered>
			<ProgressBar>
				<LineCotainer>
					<FilledLine $ratio={formatPercent(ratio)}></FilledLine>
				</LineCotainer>
				<DotsContainer justifyContent="space-between">
					<Dot
						$pass={REFFERAL_TIERS[referralNftTier].tier > 0}
						$active={REFFERAL_TIERS[referralNftTier].tier === 0}
					>
						<StyledBody mono size="xsmall" color="secondary">
							{REFFERAL_TIERS[ReferralTiers.BRONZE].threshold}
						</StyledBody>
					</Dot>
					<Dot
						left="50%"
						$pass={REFFERAL_TIERS[referralNftTier].tier > 1}
						$active={REFFERAL_TIERS[referralNftTier].tier === 1}
					>
						<StyledBody mono size="xsmall" color="secondary">
							{REFFERAL_TIERS[ReferralTiers.SILVER].threshold}
						</StyledBody>
					</Dot>
					<Dot left="100%" $pass={false} $active={REFFERAL_TIERS[referralNftTier].tier === 2}>
						<StyledBody mono size="xsmall" color="secondary">
							{REFFERAL_TIERS[ReferralTiers.GOLD].threshold}
						</StyledBody>
					</Dot>
				</DotsContainer>
			</ProgressBar>
		</FlexDivCol>
	)
})

const DotsContainer = styled(FlexDivRowCentered)`
	width: 100%;
`

const StyledBody = styled(Body)`
	margin-top: 30px;
`

const InactiveTierIconContainer = styled(FlexDivRowCentered)`
	position: relative;
`

const LineCotainer = styled.div`
	position: absolute;
	top: 50%;
	left: 0;
	width: 100%;
	height: 8px;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.button.default.background};
	transform: translateY(-50%);
`

const FilledLine = styled.div<{ $ratio: string }>`
	width: ${(props) => props.$ratio};
	height: 100%;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.checkBox.default.checked};
	border-radius: 100px;
`

const ProgressBar = styled.div`
	position: relative;
	width: calc(100% - 45px);
	margin: 15px 22.5px;
	border-radius: 100px;
`

const Dot = styled.div<{ $active: boolean; $pass: boolean; left?: string }>`
	position: absolute;
	top: 50%;
	left: ${(props) => props.left || '0%'};
	width: 16px;
	height: 16px;
	background-color: ${(props) =>
		props.$pass
			? props.theme.colors.selectedTheme.newTheme.checkBox.default.checked
			: props.$active
			? props.theme.colors.selectedTheme.newTheme.button.tab.active
			: props.theme.colors.selectedTheme.newTheme.button.default.background};
	border-radius: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	justify-content: center;
`

const CenteredNumber = styled(Body)`
	position: absolute;
	z-index: 2;
	font-size: 16px;
`

export default ReferralTiersProgressBar

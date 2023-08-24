import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import StakeNEarnIcon from 'assets/svg/earn/stake-n-earn.svg'
import TradeNEarnIcon from 'assets/svg/earn/trade-n-earn.svg'
import VoteNGovernIcon from 'assets/svg/earn/vote-n-govern.svg'
import { FlexDivCentered, FlexDivCol, FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import { GridDiv } from 'components/layout/grid'
import { MobileOnlyView } from 'components/Media'
import { NotMobileView } from 'components/Media'
import { StackSection } from 'sections/homepage/section'
import { Copy, Title } from 'sections/homepage/text'
import { SmallGoldenHeader, WhiteHeader } from 'styles/common'
import media from 'styles/media'

const EARNINGS = [
	{
		id: 'vote-and-govern',
		title: 'homepage.earning.vote-and-govern.title',
		copy: 'homepage.earning.vote-and-govern.copy',
		image: <VoteNGovernIcon />,
	},
	{
		id: 'stake-to-earn',
		title: 'homepage.earning.stake-and-earn.title',
		copy: 'homepage.earning.stake-and-earn.copy',
		image: <StakeNEarnIcon />,
	},
	{
		id: 'trade-to-earn',
		title: 'homepage.earning.trade-and-earn.title',
		copy: 'homepage.earning.trade-and-earn.copy',
		image: <TradeNEarnIcon />,
	},
]

const Earning = () => {
	const { t } = useTranslation()

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.earning.title')}</SmallGoldenHeader>
			<WhiteHeader>
				<Trans i18nKey={'homepage.earning.description'} components={[<Emphasis />]} />
			</WhiteHeader>
			<GrayCopy>{t('homepage.earning.copy')}</GrayCopy>
		</>
	)

	return (
		<StackSection>
			<Container>
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<NotMobileView>
					<StyledFlexContainer>
						{EARNINGS.map(({ id, title, copy, image }) => (
							<FeatureCard key={id}>
								<FeatureIconContainer>{image}</FeatureIconContainer>
								<FeatureContentTitle>
									<CenteredTitle>{t(title)}</CenteredTitle>
								</FeatureContentTitle>
								<CenteredCopy>{t(copy)}</CenteredCopy>
							</FeatureCard>
						))}
					</StyledFlexContainer>
				</NotMobileView>
				<MobileOnlyView>
					<StyledFlexDivColCentered>
						{EARNINGS.map(({ id, title, copy, image }) => (
							<FeatureCard key={id}>
								<FeatureIconContainer>{image}</FeatureIconContainer>
								<FeatureContentTitle>
									<CenteredTitle>{t(title)}</CenteredTitle>
								</FeatureContentTitle>
								<CenteredCopy>{t(copy)}</CenteredCopy>
							</FeatureCard>
						))}
					</StyledFlexDivColCentered>
				</MobileOnlyView>
			</Container>
		</StackSection>
	)
}

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	width: 405px;
	margin: auto;
	padding: 0px;

	${media.lessThan('sm')`
		gap: 20px;
	`}
`

const GrayCopy = styled(Copy)`
	margin-top: 17px;
	text-align: center;
	width: 446px;
	font-size: 18px;
	line-height: 100%;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	${media.lessThan('sm')`
		font-size: 16px;
		width: 336px;
		margin-bottom: 60px;
	`}
`

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryYellow};
`

const CenteredCopy = styled(Copy)`
	font-size: 15px;
	text-align: center;
	width: 300px;
	line-height: 100%;
	letter-spacing: -0.03em;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`

const CenteredTitle = styled(Title)`
	font-family: ${(props) => props.theme.fonts.black};
	font-variant: all-small-caps;
	text-transform: uppercase;
	font-size: 24px;
`

const Container = styled(GridDiv)`
	width: 100vw;
	overflow: hidden;
	justify-content: center;
	padding: 110px 0px;
`

const StyledFlexContainer = styled(FlexDivRow)`
	width: 1160px;
	justify-content: center;
	gap: 20px;
	margin-top: 40px;

	${media.lessThan('lgUp')`
		width: 100%;
		flex-wrap: wrap;
	`}
`

const FeatureCard = styled(FlexDivCol)`
	padding: 25px;
	background-color: #1a1a1a;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.05);
`

const FeatureIconContainer = styled.div`
	padding-bottom: 15px;
	svg {
		width: 64px;
		height: 64px;
	}
	display: flex;
	justify-content: center;
`

const FeatureContentTitle = styled(FlexDivCentered)`
	padding-bottom: 5px;
	justify-content: center;
`

export default Earning

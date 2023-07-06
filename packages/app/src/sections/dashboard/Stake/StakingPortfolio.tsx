import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { StakingCards } from 'pages/dashboard/staking'
import media from 'styles/media'

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
	Redeem = 'redeem',
}

type StakingPortfolioProps = {
	cards: StakingCards[]
}

const StakingPortfolio: FC<StakingPortfolioProps> = ({ cards }) => {
	const { t } = useTranslation()

	return (
		<StakingPortfolioContainer>
			<StakingHeading>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">{t('dashboard.stake.portfolio.title')}</StyledHeading>
				</FlexDivCol>
				<StyledButton
					size="xsmall"
					isRounded
					textTransform="none"
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					{t('dashboard.stake.docs')}
				</StyledButton>
			</StakingHeading>
			<CardsContainer>
				{cards.map(({ category, card }, i) => (
					<StyledFlexDivCol rowGap="15px" key={i}>
						<Body size="large">{category}</Body>
						<FlexDivRow columnGap="15px" justifyContent="flex-start">
							{card.map(({ key, title, value, onClick }) => (
								<FlexDivCol key={key} onClick={onClick} rowGap="5px">
									<Body color="secondary">{title}</Body>
									<Body size="large" color="preview">
										{value}
									</Body>
								</FlexDivCol>
							))}
						</FlexDivRow>
					</StyledFlexDivCol>
				))}
			</CardsContainer>
		</StakingPortfolioContainer>
	)
}

const StyledFlexDivCol = styled(FlexDivCol)`
	${media.lessThan('lg')`
		width: 135px;
	`}
`

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`
const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const StakingHeading = styled(FlexDivRowCentered)`
	margin-bottom: 30px;
`

const StakingPortfolioContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}
	${media.greaterThan('lg')`
		margin-top: 20px;
	`}
`

const CardsContainer = styled(FlexDivRowCentered)`
	padding: 20px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border-radius: 20px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	justify-content: flex-start;
	column-gap: 50px;
	row-gap: 25px;
	flex-flow: row wrap;
	${media.lessThan('md')`
		column-gap: 25px;
	`}
`

export default StakingPortfolio

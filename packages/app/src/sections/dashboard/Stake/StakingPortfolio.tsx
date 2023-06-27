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
	TradingRewards = 'trading-rewards',
	Redemption = 'redemption',
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
					<Body color="secondary">
						Lorem ipsum dolor sit amet consectetur. Ut in nisl ut quam condimentum lacus.
					</Body>
				</FlexDivCol>
				<Button
					size="xsmall"
					isRounded
					textTransform="none"
					style={{ borderWidth: '0px' }}
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					Docs →
				</Button>
			</StakingHeading>
			<CardsContainer>
				{cards.map(({ category, card }, i) => (
					<FlexDivCol rowGap="15px" key={i}>
						<Body size="large">{category}</Body>
						<FlexDivRow columnGap="15px">
							{card.map(({ key, title, value, onClick }) => (
								<FlexDivCol key={key} onClick={onClick} rowGap="5px">
									<Body color="secondary">{title}</Body>
									<Body size="large" color="preview">
										{value}
									</Body>
								</FlexDivCol>
							))}
						</FlexDivRow>
					</FlexDivCol>
				))}
			</CardsContainer>
		</StakingPortfolioContainer>
	)
}

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
	${media.greaterThan('mdUp')`
		margin-top: 20px;
	`}
`

const CardsContainer = styled(FlexDivRowCentered)`
	padding: 20px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border-radius: 20px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	width: 100%;
	justify-content: flex-start;
	column-gap: 60px;

	${media.lessThan('md')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		row-gap: 25px;
	`}
`

export default StakingPortfolio

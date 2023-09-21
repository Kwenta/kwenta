import { FC, memo } from 'react'
import styled, { css } from 'styled-components'

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body } from 'components/Text'
import media from 'styles/media'

import { StakingHeading } from './StakingHeading'
import { StakingCards } from './types'

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
}

type StakingPortfolioProps = {
	title: string
	cardsInfo: StakingCards[]
}

const StakingPortfolio: FC<StakingPortfolioProps> = memo(({ title, cardsInfo }) => {
	return (
		<StakingPortfolioContainer>
			<StakingHeading title={title} />
			<CardsContainer>
				{cardsInfo.map(({ key, category, card, onClick, icon }) => (
					<StyledFlexDivCol key={key} rowGap="15px" onClick={onClick}>
						<LabelContainer size="large">
							{category}
							{icon}
						</LabelContainer>
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
})

const LabelContainer = styled(Body)`
	display: flex;
	flex-direction: row;
	column-gap: 5px;
	align-items: center;
`

const StyledFlexDivCol = styled(FlexDivCol)`
	${(props) =>
		props.onClick &&
		css`
			cursor: pointer;
		`}
	${media.lessThan('lg')`
		width: 135px;
	`}
`

const StakingPortfolioContainer = styled.div`
	${media.lessThan('lg')`
		padding: 0px 15px;
	`}
	margin-top: 20px;
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

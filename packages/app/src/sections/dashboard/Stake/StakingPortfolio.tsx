import { truncateNumbers } from '@kwenta/sdk/utils'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { useAppSelector } from 'state/hooks'
import {
	selectClaimableBalance,
	selectEscrowedKwentaBalance,
	selectKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	selectTotalVestable,
} from 'state/staking/selectors'
import media from 'styles/media'

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
	TradingRewards = 'trading-rewards',
	Redemption = 'redemption',
}

type StakingPortfolioProps = {
	setCurrentTab(tab: StakeTab): void
}

const StakingPortfolio: FC<StakingPortfolioProps> = ({ setCurrentTab }) => {
	const { t } = useTranslation()
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const escrowedKwentaBalance = useAppSelector(selectEscrowedKwentaBalance)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const totalVestable = useAppSelector(selectTotalVestable)

	const DEFAULT_CARDS = [
		{
			category: t('dashboard.stake.portfolio.balance.title'),
			card: [
				{
					key: 'balance-liquid',
					title: t('dashboard.stake.portfolio.balance.liquid'),
					value: truncateNumbers(kwentaBalance, 2),
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
				{
					key: 'balance-escrow',
					title: t('dashboard.stake.portfolio.balance.escrow'),
					value: truncateNumbers(escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance), 2),
					onClick: () => setCurrentTab(StakeTab.Escrow),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.escrow.title'),
			card: [
				{
					key: 'escrow-staked',
					title: t('dashboard.stake.portfolio.escrow.staked'),
					value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
					onClick: () => setCurrentTab(StakeTab.Escrow),
				},
				{
					key: 'escrow-vestable',
					title: t('dashboard.stake.portfolio.escrow.vestable'),
					value: truncateNumbers(totalVestable, 2),
					onClick: () => setCurrentTab(StakeTab.Escrow),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.rewards.title'),
			card: [
				{
					key: 'rewards-claimable',
					title: t('dashboard.stake.portfolio.rewards.claimable'),
					value: truncateNumbers(claimableBalance, 2),
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.early-vest-rewards.title'),
			card: [
				{
					key: 'early-vest-rewards-claimable',
					title: t('dashboard.stake.portfolio.early-vest-rewards.claimable'),
					value: 100,
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
				{
					key: 'early-vest-rewards-epoch',
					title: t('dashboard.stake.portfolio.early-vest-rewards.epoch'),
					value: 31,
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.cooldown.title'),
			card: [
				{
					key: 'cooldown-time-left',
					title: t('dashboard.stake.portfolio.cooldown.time-left'),
					value: '2D:12H:12:12',
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
				{
					key: 'cooldown-last-date',
					title: t('dashboard.stake.portfolio.cooldown.last-date'),
					value: '22/09/23',
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
	]

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
				{DEFAULT_CARDS.map(({ category, card }, i) => (
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
`

export default StakingPortfolio

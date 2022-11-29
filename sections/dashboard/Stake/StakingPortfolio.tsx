import { wei } from '@synthetixio/wei';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import Text from 'components/Text';
import { EXTERNAL_LINKS } from 'constants/links';
import { useStakingContext } from 'contexts/StakingContext';
import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';
import { truncateNumbers } from 'utils/formatters/number';

import { SplitStakingCard } from './common';
import StakingTabs from './StakingTabs';

export enum StakeTab {
	Staking = 'staking',
	Escrow = 'escrow',
	TradingRewards = 'trading-rewards',
	Redemption = 'redemption',
}

const StakingPortfolio = () => {
	const { t } = useTranslation();
	const [currentTab, setCurrentTab] = useState(StakeTab.Staking);

	const {
		escrowedBalance,
		totalVestable,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		kwentaBalance,
	} = useStakingContext();

	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: truncateNumbers(kwentaBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: truncateNumbers(escrowedBalance.sub(stakedEscrowedBalance), 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: truncateNumbers(stakedNonEscrowedBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: truncateNumbers(stakedEscrowedBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: truncateNumbers(claimableBalance, 2),
				onClick: () => setCurrentTab(StakeTab.Staking),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: truncateNumbers(wei(totalVestable), 2),
				onClick: () => setCurrentTab(StakeTab.Escrow),
			},
		],
	];

	return (
		<>
			<StakingPortfolioContainer>
				<FlexDivRowCentered>
					<Header variant="h4">{t('dashboard.stake.portfolio.title')}</Header>
					<StyledTabButton
						isRounded
						title={'Staking Docs'}
						active={true}
						onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
					/>
				</FlexDivRowCentered>
				<CardsContainer>
					{DEFAULT_CARDS.map((card) => (
						<SplitStakingCard>
							{card.map(({ key, title, value, onClick }) => (
								<div key={key} onClick={onClick}>
									<div className="title">{title}</div>
									<div className="value">{value}</div>
								</div>
							))}
						</SplitStakingCard>
					))}
				</CardsContainer>
			</StakingPortfolioContainer>
			<StakingTabs currentTab={currentTab} />
		</>
	);
};

const StyledTabButton = styled(TabButton)`
	p {
		font-size: 12px;
	}
	margin-bottom: 9px;
`;
const StakingPortfolioContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-bottom: 100px;
	`}
`;

const Header = styled(Text.Heading)`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	margin-bottom: 15px;
	font-variant: all-small-caps;
`;

const CardsContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(334px, 1fr));
	grid-gap: 15px;
`;

export default StakingPortfolio;

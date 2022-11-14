import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Text from 'components/Text';
import { useStakingContext } from 'contexts/StakingContext';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';
import { truncateNumbers } from 'utils/formatters/number';

import { SplitStakingCard } from './common';

const StakingPortfolio = () => {
	const { t } = useTranslation();
	const {
		escrowedBalance,
		totalVestable,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		kwentaBalance,
	} = useStakingContext();

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: truncateNumbers(kwentaBalance, 2),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: truncateNumbers(escrowedBalance.sub(stakedEscrowedBalance), 2),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: truncateNumbers(stakedNonEscrowedBalance, 2),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: truncateNumbers(stakedEscrowedBalance, 2),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: truncateNumbers(claimableBalance, 2),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: truncateNumbers(totalVestable, 2),
			},
		],
	];

	return (
		<StakingPortfolioContainer>
			<Header $darkTheme={isDarkTheme} variant="h4">
				{t('dashboard.stake.portfolio.title')}
			</Header>
			<CardsContainer>
				{DEFAULT_CARDS.map((card) => (
					<SplitStakingCard $darkTheme={isDarkTheme}>
						{card.map(({ key, title, value }) => (
							<div key={key}>
								<div className="title">{title}</div>
								<div className="value">{value}</div>
							</div>
						))}
					</SplitStakingCard>
				))}
			</CardsContainer>
		</StakingPortfolioContainer>
	);
};

const StakingPortfolioContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-bottom: 100px;
	`}
`;

const Header = styled(Text.Heading)<{ $darkTheme: boolean }>`
	color: ${(props) => (props.$darkTheme ? props.theme.colors.selectedTheme.text.value : '#6A3300')};
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

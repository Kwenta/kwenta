import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useBalance } from 'wagmi';

import Text from 'components/Text';
import Connector from 'containers/Connector';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';
import { zeroBN } from 'utils/formatters/number';

import { SplitStakingCard } from './common';

const StakingPortfolio = () => {
	const { walletAddress } = Connector.useContainer();
	const { t } = useTranslation();
	const { data: ethBalance, isSuccess: ethBalanceIsSuccess } = useBalance({
		addressOrName: walletAddress ?? undefined,
	});

	const rewardBalances = ethBalanceIsSuccess ? ethBalance?.formatted ?? zeroBN : zeroBN;

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: Number(rewardBalances).toFixed(2),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: '2923.39',
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: '2923.39',
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: '2923.39',
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: '23.22',
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: '23.22',
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
								<div>
									<div className="title">{title}</div>
									<div className="value">{value}</div>
								</div>
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

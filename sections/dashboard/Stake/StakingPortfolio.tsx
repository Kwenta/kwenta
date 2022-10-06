import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useBalance, useContractRead } from 'wagmi';

import Text from 'components/Text';
import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';
import { zeroBN } from 'utils/formatters/number';

import { SplitStakingCard } from './common';

const KWNETA_TOKEN = '0xDA0C33402Fc1e10d18c532F0Ed9c1A6c5C9e386C';
const STAKING_REWARDS = '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a';
const REWARD_ESCROW = '0xaFD87d1a62260bD5714C55a1BB4057bDc8dFA413';

const StakingPortfolio = () => {
	const { walletAddress } = Connector.useContainer();
	const { t } = useTranslation();

	const { data: kwentaBalance } = useBalance({
		addressOrName: walletAddress ?? undefined,
		token: KWNETA_TOKEN,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('kwentaBalance Settled', { data, error });
		},
	});

	const { data: escrowedBalance } = useContractRead({
		addressOrName: REWARD_ESCROW,
		contractInterface: rewardEscrowABI,
		functionName: 'balanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('escrowedBalance Settled', { data, error });
		},
	});

	const { data: vestedBalance } = useContractRead({
		addressOrName: REWARD_ESCROW,
		contractInterface: rewardEscrowABI,
		functionName: 'totalVestedAccountBalance',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('vestedBalance Settled', { data, error });
		},
	});

	// const { data: stakedBalance } = useContractRead({
	// 	addressOrName: STAKING_REWARDS,
	// 	contractInterface: stakingRewardsABI,
	// 	functionName: 'balanceOf',
	// 	args: [walletAddress ?? undefined],
	// 	cacheOnBlock: true,
	// 	onSettled(data, error) {
	// 		// eslint-disable-next-line no-console
	// 		console.log('stakedBalance Settled', { data, error });
	// 	},
	// });

	const { data: stakedNonEscrowedBalance } = useContractRead({
		addressOrName: STAKING_REWARDS,
		contractInterface: stakingRewardsABI,
		functionName: 'nonEscrowedBalanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('nonEscrowedBalance Settled', { data, error });
		},
	});

	const { data: stakedEscrowedBalance } = useContractRead({
		addressOrName: STAKING_REWARDS,
		contractInterface: stakingRewardsABI,
		functionName: 'escrowedBalanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('stakedEscrowedBalanceOf Settled', { data, error });
		},
	});

	const { data: claimableBalance } = useContractRead({
		addressOrName: STAKING_REWARDS,
		contractInterface: stakingRewardsABI,
		functionName: 'earned',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			// eslint-disable-next-line no-console
			console.log('claimableBalance Settled', { data, error });
		},
	});

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: Number(kwentaBalance?.formatted).toFixed(2),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: Number(wei(escrowedBalance ?? zeroBN)).toFixed(2),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: Number(wei(stakedNonEscrowedBalance ?? zeroBN)).toFixed(2),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: Number(wei(stakedEscrowedBalance ?? zeroBN)).toFixed(2),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: Number(wei(claimableBalance ?? zeroBN)).toFixed(2),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: Number(wei(vestedBalance ?? zeroBN)).toFixed(2),
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

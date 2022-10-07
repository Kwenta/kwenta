import { wei } from '@synthetixio/wei';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { erc20ABI, useContractReads } from 'wagmi';

import Text from 'components/Text';
import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import { currentThemeState } from 'store/ui';
import media from 'styles/media';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import { SplitStakingCard } from './common';

const kwentaTokenContract = {
	addressOrName: '0xDA0C33402Fc1e10d18c532F0Ed9c1A6c5C9e386C',
	contractInterface: erc20ABI,
};
const stakingRewardsContract = {
	addressOrName: '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a',
	contractInterface: stakingRewardsABI,
};

const rewardEscrowContract = {
	addressOrName: '0xaFD87d1a62260bD5714C55a1BB4057bDc8dFA413',
	contractInterface: rewardEscrowABI,
};

const StakingPortfolio = () => {
	const { walletAddress } = Connector.useContainer();
	const { t } = useTranslation();
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);
	const [escrowedBalance, setEscrowedBalance] = useState(zeroBN);
	const [vestedBalance, setVestedBalance] = useState(zeroBN);
	const [stakedNonEscrowedBalance, setStakedNonEscrowedBalance] = useState(zeroBN);
	const [stakedEscrowedBalance, setStakedEscrowedBalance] = useState(zeroBN);
	const [claimableBalance, setClaimableBalance] = useState(zeroBN);

	useContractReads({
		contracts: [
			{
				...rewardEscrowContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...rewardEscrowContract,
				functionName: 'totalVestedAccountBalance',
				args: [walletAddress ?? undefined],
			},
			{
				...stakingRewardsContract,
				functionName: 'nonEscrowedBalanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...stakingRewardsContract,
				functionName: 'escrowedBalanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...stakingRewardsContract,
				functionName: 'earned',
				args: [walletAddress ?? undefined],
			},
			{
				...kwentaTokenContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
		],
		cacheOnBlock: true,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setEscrowedBalance(wei(data[0] ?? zeroBN));
				setVestedBalance(wei(data[1] ?? zeroBN));
				setStakedNonEscrowedBalance(wei(data[2] ?? zeroBN));
				setStakedEscrowedBalance(wei(data[3] ?? zeroBN));
				setClaimableBalance(wei(data[4] ?? zeroBN));
				setKwentaBalance(wei(data[5] ?? zeroBN));
			}
		},
	});

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);
	const DEFAULT_CARDS = [
		[
			{
				key: 'Liquid',
				title: t('dashboard.stake.portfolio.liquid'),
				value: Number(kwentaBalance).toFixed(2),
			},
			{
				key: 'Escrow',
				title: t('dashboard.stake.portfolio.escrow'),
				value: Number(escrowedBalance).toFixed(2),
			},
		],
		[
			{
				key: 'Staked',
				title: t('dashboard.stake.portfolio.staked'),
				value: Number(stakedNonEscrowedBalance).toFixed(2),
			},
			{
				key: 'StakedEscrow',
				title: t('dashboard.stake.portfolio.staked-escrow'),
				value: Number(stakedEscrowedBalance).toFixed(2),
			},
		],
		[
			{
				key: 'Claimable',
				title: t('dashboard.stake.portfolio.claimable'),
				value: Number(claimableBalance).toFixed(2),
			},
			{
				key: 'Vestable',
				title: t('dashboard.stake.portfolio.vestable'),
				value: Number(vestedBalance).toFixed(2),
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

import { wei } from '@synthetixio/wei';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { erc20ABI, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';

import Button from 'components/Button';
import SegmentedControl from 'components/SegmentedControl';
import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import { currentThemeState } from 'store/ui';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import { StakingCard } from './common';
import StakeInput from './StakeInput';

type StakingInputCardProps = {
	inputLabel: string;
	tableType: 'stake' | 'escrow' | 'redeem';
};

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

const StakingInputCard: FC<StakingInputCardProps> = ({ inputLabel, tableType }) => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();

	const { data: kwentaBalance } = useContractRead({
		...kwentaTokenContract,
		functionName: 'balanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onError(error) {
			if (error) logError(error);
		},
	});

	const { data: stakedNonEscrowedBalance } = useContractRead({
		...stakingRewardsContract,
		functionName: 'nonEscrowedBalanceOf',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onError(error) {
			if (error) logError(error);
		},
	});

	const currentTheme = useRecoilValue(currentThemeState);
	const isDarkTheme = useMemo(() => currentTheme === 'dark', [currentTheme]);

	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (tabIndex: number) => {
		setActiveTab(tabIndex);
	};

	const { config: stakedKwenta } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'stake',
		args: ['20000000000000000000'],
		enabled: !!walletAddress,
	});

	const { config: unstakedKwenta } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'unstake',
		args: ['20000000000000000000'],
		enabled: !!walletAddress,
	});

	const { config: stakedEscrowKwenta } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'stakeEscrow',
		args: ['20000000000000000000'],
		enabled: !!walletAddress,
	});

	const { config: unstakedEscrowKwenta } = usePrepareContractWrite({
		...rewardEscrowContract,
		functionName: 'unstakeEscrow',
		args: ['20000000000000000000'],
		enabled: !!walletAddress,
	});

	const { write: stakingKwenta } = useContractWrite(stakedKwenta);
	const { write: unstakingKwenta } = useContractWrite(unstakedKwenta);
	const { write: stakingEscrowKwenta } = useContractWrite(stakedEscrowKwenta);
	const { write: unstakingEscrowKwenta } = useContractWrite(unstakedEscrowKwenta);

	return (
		<StakingInputCardContainer $darkTheme={isDarkTheme}>
			{(tableType === 'stake' || tableType === 'escrow') && (
				<SegmentedControl
					values={[
						t('dashboard.stake.tabs.stake-table.stake'),
						t('dashboard.stake.tabs.stake-table.unstake'),
					]}
					onChange={handleTabChange}
					selectedIndex={activeTab}
					style={{ marginBottom: '20px' }}
				/>
			)}
			<StakeInput
				label={inputLabel}
				maxBalance={
					activeTab === 0 ? wei(kwentaBalance ?? zeroBN) : wei(stakedNonEscrowedBalance ?? zeroBN)
				}
			/>
			{tableType === 'stake' ? (
				<Button
					fullWidth
					variant="flat"
					size="sm"
					onClick={() => (activeTab === 0 ? stakingKwenta?.() : unstakingKwenta?.())}
					style={{ marginTop: '20px' }}
				>
					{activeTab === 0
						? t('dashboard.stake.tabs.stake-table.stake')
						: t('dashboard.stake.tabs.stake-table.unstake')}
				</Button>
			) : tableType === 'escrow' ? (
				<Button
					fullWidth
					variant="flat"
					size="sm"
					onClick={() => (activeTab === 0 ? stakingEscrowKwenta?.() : unstakingEscrowKwenta?.())}
					style={{ marginTop: '20px' }}
				>
					{activeTab === 0
						? t('dashboard.stake.tabs.stake-table.stake')
						: t('dashboard.stake.tabs.stake-table.unstake')}
				</Button>
			) : (
				<Button fullWidth variant="flat" size="sm">
					{t('dashboard.stake.tabs.stake-table.redeem')}
				</Button>
			)}
		</StakingInputCardContainer>
	);
};

const StakingInputCardContainer = styled(StakingCard)<{ $darkTheme: boolean }>`
	min-height: 200px;
	max-height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export default StakingInputCard;

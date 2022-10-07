import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractRead, useContractReads } from 'wagmi';

import Connector from 'containers/Connector';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import supplyScheduleABI from 'lib/abis/SupplySchedule.json';
import media from 'styles/media';
import logError from 'utils/logError';

import StakingInputCard from './StakingInputCard';

const stakingRewardsContract = {
	addressOrName: '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a',
	contractInterface: stakingRewardsABI,
};

const supplyScheduleContract = {
	addressOrName: '0x671423b2e8a99882fd14bbd07e90ae8b64a0e63a',
	contractInterface: supplyScheduleABI,
};

const RedemptionTab = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();

	useContractRead({
		...stakingRewardsContract,
		functionName: 'earned',
		args: [walletAddress ?? undefined],
		cacheOnBlock: true,
		onSettled(data, error) {
			if (error) logError(error);
		},
	});

	useContractReads({
		contracts: [
			{
				...supplyScheduleContract,
				functionName: 'DECAY_RATE',
			},
			{
				...supplyScheduleContract,
				functionName: 'INITIAL_WEEKLY_SUPPLY',
			},
			{
				...supplyScheduleContract,
				functionName: 'weekCounter',
			},
			{
				...stakingRewardsContract,
				functionName: 'totalSupply',
			},
		],
		cacheOnBlock: true,
		onSettled(data, error) {
			if (error) logError(error);
		},
	});

	return (
		<StakingTabContainer>
			<StakingInputCard
				inputLabel={t('dashboard.stake.tabs.stake-table.vkwenta-token')}
				tableType={'redeem'}
			/>
			<StakingInputCard
				inputLabel={t('dashboard.stake.tabs.stake-table.vekwenta-token')}
				tableType={'redeem'}
			/>
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		& > div {
			flex: 1;

			&:first-child {
				margin-right: 15px;
			}
		}
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

export default RedemptionTab;

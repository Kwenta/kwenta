import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { useMemo, useState } from 'react';
import { erc20ABI, useContractReads, usePrepareContractWrite } from 'wagmi';

import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import supplyScheduleABI from 'lib/abis/SupplySchedule.json';
import vKwentaRedeemerABI from 'lib/abis/vKwentaRedeemer.json';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

const useStakingData = () => {
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

	const supplyScheduleContract = {
		addressOrName: '0x671423b2e8a99882fd14bbd07e90ae8b64a0e63a',
		contractInterface: supplyScheduleABI,
	};

	const vKwentaTokenContract = {
		addressOrName: '0xb897D76bC9F7efB66Fb94970371ef17998c296b6',
		contractInterface: erc20ABI,
	};

	const vKwentaRedeemerContract = {
		addressOrName: '0x03c3E61D624F279243e1c8b43eD0fCF6790D10E9',
		contractInterface: vKwentaRedeemerABI,
	};

	const epochPeriod = 1;
	const { walletAddress } = Connector.useContainer();
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);
	const [escrowedBalance, setEscrowedBalance] = useState(zeroBN);
	const [vestedBalance, setVestedBalance] = useState(zeroBN);
	const [stakedNonEscrowedBalance, setStakedNonEscrowedBalance] = useState(zeroBN);
	const [stakedEscrowedBalance, setStakedEscrowedBalance] = useState(zeroBN);
	const [claimableBalance, setClaimableBalance] = useState(zeroBN);
	const [apy, setApy] = useState('0');
	const [vKwentaBalance, setVKwentaBalance] = useState(zeroBN);
	const [vKwentaAllowance, setVKwentaAllowance] = useState(zeroBN);
	const [kwentaAllowance, setKwentaAllowance] = useState(zeroBN);
	const [currentWeeklyReward, setCurrentWeeklyReward] = useState(zeroBN);

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
			{
				...vKwentaTokenContract,
				functionName: 'balanceOf',
				args: [walletAddress ?? undefined],
			},
			{
				...vKwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress ?? undefined, vKwentaRedeemerContract.addressOrName],
			},
			{
				...kwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress ?? undefined, stakingRewardsContract.addressOrName],
			},
		],
		watch: true,
		allowFailure: true,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setEscrowedBalance(wei(data[0] ?? zeroBN));
				setVestedBalance(wei(data[1] ?? zeroBN));
				setStakedNonEscrowedBalance(wei(data[2] ?? zeroBN));
				setStakedEscrowedBalance(wei(data[3] ?? zeroBN));
				setClaimableBalance(wei(data[4] ?? zeroBN));
				setKwentaBalance(wei(data[5] ?? zeroBN));
				const supplyRate = wei(1).sub(wei(data[6] ?? zeroBN));
				const initialWeeklySupply = wei(data[7] ?? zeroBN);
				const weekCounter = Number(data[8] ?? zeroBN);
				const totalSupply = wei(data[9] ?? zeroBN);
				const startWeeklySupply = initialWeeklySupply.mul(supplyRate.pow(weekCounter));
				const yearlyRewards = totalSupply.gt(zeroBN)
					? startWeeklySupply.mul(wei(1).sub(supplyRate.pow(52))).div(wei(1).sub(supplyRate))
					: zeroBN;
				setCurrentWeeklyReward(startWeeklySupply.mul(0.2));
				setApy(yearlyRewards.gt(zeroBN) ? Number(yearlyRewards.div(totalSupply)).toFixed(2) : '0');
				setVKwentaBalance(wei(data[10] ?? zeroBN));
				setVKwentaAllowance(wei(data[11] ?? zeroBN));
				setKwentaAllowance(wei(data[12] ?? zeroBN));
			}
		},
	});

	const kwentaTokenApproval = useMemo(() => kwentaBalance.gt(kwentaAllowance), [
		kwentaBalance,
		kwentaAllowance,
	]);

	const vkwentaTokenApproval = useMemo(() => vKwentaBalance.gt(vKwentaAllowance), [
		vKwentaBalance,
		vKwentaAllowance,
	]);

	const { config: getRewardConfig } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'getReward',
		enabled: claimableBalance.gt(0),
	});

	const { config: kwentaApproveConfig } = usePrepareContractWrite({
		...kwentaTokenContract,
		functionName: 'approve',
		args: [stakingRewardsContract.addressOrName, ethers.constants.MaxUint256],
		enabled: kwentaTokenApproval,
		staleTime: Infinity,
	});

	const { config: vKwentaApproveConfig } = usePrepareContractWrite({
		...vKwentaTokenContract,
		functionName: 'approve',
		args: [vKwentaRedeemerContract.addressOrName, ethers.constants.MaxUint256],
		enabled: vkwentaTokenApproval,
		staleTime: Infinity,
	});

	const { config: redeemConfig } = usePrepareContractWrite({
		...vKwentaRedeemerContract,
		functionName: 'redeem',
		enabled: wei(vKwentaBalance).gt(0),
		staleTime: Infinity,
	});

	return {
		epochPeriod,
		escrowedBalance,
		vestedBalance,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		kwentaBalance,
		apy,
		currentWeeklyReward,
		vKwentaBalance,
		vKwentaAllowance,
		kwentaAllowance,
		getRewardConfig,
		kwentaApproveConfig,
		vKwentaApproveConfig,
		redeemConfig,
		kwentaTokenApproval,
		vkwentaTokenApproval,
		stakingRewardsContract,
		rewardEscrowContract,
		vKwentaRedeemerContract,
	};
};

export default useStakingData;

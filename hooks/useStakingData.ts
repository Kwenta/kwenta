import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import _ from 'lodash';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { erc20ABI, useContractRead, useContractReads, usePrepareContractWrite } from 'wagmi';

import {
	KWENTA_TOKEN_ADDRESS,
	REWARD_ESCROW,
	STAKING_REWARDS,
	SUPPLY_SCHEDULE,
	TRADING_REWARDS,
	VKWENTA_REDEEMER,
	VKWENTA_TOKEN_ADDRESS,
	VEKWENTA_REDEEMER,
	VEKWENTA_TOKEN_ADDRESS,
} from 'constants/address';
import Connector from 'containers/Connector';
import multipleMerkleDistributorABI from 'lib/abis/MultipleMerkleDistributor.json';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import supplyScheduleABI from 'lib/abis/SupplySchedule.json';
import veKwentaRedeemerABI from 'lib/abis/veKwentaRedeemer.json';
import vKwentaRedeemerABI from 'lib/abis/vKwentaRedeemer.json';
import {
	getEpochDetails,
	STAKING_HIGH_GAS_LIMIT,
	STAKING_LOW_GAS_LIMIT,
} from 'queries/staking/utils';
import { formatTruncatedDuration } from 'utils/formatters/date';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import useIsL2 from './useIsL2';

export type EscrowRow = {
	id: number;
	date: string;
	time: string;
	vestable: number;
	amount: number;
	fee: number;
	status: 'VESTED' | 'VESTING';
};

type VestingEntry = {
	endTime: number;
	escrowAmount: number;
	entryID: number;
};

type VestingClaimable = {
	quantity: number;
	fee: number;
};

const useStakingData = () => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const kwentaTokenContract = {
		address: KWENTA_TOKEN_ADDRESS[network?.id],
		abi: erc20ABI,
	};

	const stakingRewardsContract = {
		address: STAKING_REWARDS[network?.id],
		abi: stakingRewardsABI,
	};

	const rewardEscrowContract = useMemo(() => {
		return {
			address: REWARD_ESCROW[network?.id],
			abi: rewardEscrowABI,
		};
	}, [network?.id]);

	const supplyScheduleContract = {
		address: SUPPLY_SCHEDULE[network?.id],
		abi: supplyScheduleABI,
	};

	const vKwentaTokenContract = {
		address: VKWENTA_TOKEN_ADDRESS[network?.id],
		abi: erc20ABI,
	};

	const vKwentaRedeemerContract = {
		address: VKWENTA_REDEEMER[network?.id],
		abi: vKwentaRedeemerABI,
	};

	const veKwentaTokenContract = {
		address: VEKWENTA_TOKEN_ADDRESS[network?.id],
		abi: erc20ABI,
	};

	const veKwentaRedeemerContract = {
		address: VEKWENTA_REDEEMER[network?.id],
		abi: veKwentaRedeemerABI,
	};

	const multipleMerkleDistributorContract = {
		address: TRADING_REWARDS[network?.id],
		abi: multipleMerkleDistributorABI,
	};

	const [epochPeriod, setEpochPeriod] = useState(0);
	const [weekCounter, setWeekCounter] = useState(1);
	const { walletAddress } = Connector.useContainer();
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);
	const [escrowedBalance, setEscrowedBalance] = useState(zeroBN);
	const [stakedNonEscrowedBalance, setStakedNonEscrowedBalance] = useState(zeroBN);
	const [stakedEscrowedBalance, setStakedEscrowedBalance] = useState(zeroBN);
	const [totalStakedBalance, setTotalStakedBalance] = useState(zeroBN);
	const [claimableBalance, setClaimableBalance] = useState(zeroBN);
	const [vKwentaBalance, setVKwentaBalance] = useState(zeroBN);
	const [vKwentaAllowance, setVKwentaAllowance] = useState(zeroBN);
	const [kwentaAllowance, setKwentaAllowance] = useState(zeroBN);
	const [veKwentaBalance, setVEKwentaBalance] = useState(zeroBN);
	const [veKwentaAllowance, setVEKwentaAllowance] = useState(zeroBN);
	const [totalVestable, setTotalVestable] = useState(0);

	useContractReads({
		scopeKey: 'staking',
		contracts: [
			{
				...rewardEscrowContract,
				functionName: 'balanceOf',
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
				args: [walletAddress!],
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
				args: [walletAddress!],
			},
			{
				...vKwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress!, vKwentaRedeemerContract.address],
			},
			{
				...kwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress!, stakingRewardsContract.address],
			},
			{
				...multipleMerkleDistributorContract,
				functionName: 'distributionEpoch',
			},
			{
				...veKwentaTokenContract,
				functionName: 'balanceOf',
				args: [walletAddress!],
			},
			{
				...veKwentaTokenContract,
				functionName: 'allowance',
				args: [walletAddress!, veKwentaRedeemerContract.address],
			},
		],
		watch: true,
		enabled: !!walletAddress && isL2,
		allowFailure: true,
		onSettled(data, error) {
			if (error) logError(error);
			if (data) {
				setEscrowedBalance(wei(data[0] ?? zeroBN));
				setStakedNonEscrowedBalance(wei(data[1] ?? zeroBN));
				setStakedEscrowedBalance(wei(data[2] ?? zeroBN));
				setClaimableBalance(wei(data[3] ?? zeroBN));
				setKwentaBalance(wei(data[4] ?? zeroBN));
				setWeekCounter(Number(data[5] ?? 1) ?? 1);
				setTotalStakedBalance(wei(data[6] ?? zeroBN));
				setVKwentaBalance(wei(data[7] ?? zeroBN));
				setVKwentaAllowance(wei(data[8] ?? zeroBN));
				setKwentaAllowance(wei(data[9] ?? zeroBN));
				setEpochPeriod(Number(data[10] ?? 0) ?? 0);
				setVEKwentaBalance(wei(data[11] ?? zeroBN));
				setVEKwentaAllowance(wei(data[12] ?? zeroBN));
			}
		},
	});

	const periods = useMemo(() => {
		let periods: number[] = [];
		for (let i = 0; i <= epochPeriod; i++) {
			periods.push(i);
		}
		return periods;
	}, [epochPeriod]);

	const { data: vestingSchedules } = useContractRead({
		...rewardEscrowContract,
		functionName: 'getVestingSchedules',
		args: [walletAddress ?? undefined, 0, 1000],
		scopeKey: 'staking',
		watch: true,
		enabled: !!walletAddress,
		select: (data) => (data as VestingEntry[]).filter((d) => d.escrowAmount > 0),
	});

	const escrowRows: EscrowRow[] = useMemo(() => {
		if (vestingSchedules && (vestingSchedules as VestingEntry[]).length > 0) {
			return (vestingSchedules as VestingEntry[]).map((d: VestingEntry) => ({
				id: Number(d.entryID),
				date: moment(Number(d.endTime) * 1000).format('MM/DD/YY'),
				time: formatTruncatedDuration(d.endTime - new Date().getTime() / 1000),
				vestable: d.endTime * 1000 > Date.now() ? 0 : Number(d.escrowAmount / 1e18),
				amount: Number(d.escrowAmount / 1e18),
				fee: d.endTime * 1000 > Date.now() ? Number(d.escrowAmount / 1e18) : 0,
				status: d.endTime * 1000 > Date.now() ? 'VESTING' : 'VESTED',
			}));
		}
		return [];
	}, [vestingSchedules]);

	const vestingEntries = useMemo(() => {
		return escrowRows.map((d) => ({
			...rewardEscrowContract,
			functionName: 'getVestingEntryClaimable',
			args: [walletAddress ?? undefined, d?.id],
			enabled: !!walletAddress,
		}));
	}, [escrowRows, rewardEscrowContract, walletAddress]);

	useContractReads({
		contracts: vestingEntries,
		scopeKey: 'staking',
		watch: true,
		enabled: !!walletAddress && vestingEntries.length > 0,
		onSuccess(data) {
			(data as VestingClaimable[]).forEach((d, index) => {
				escrowRows[index].vestable = d.quantity / 1e18 ?? 0;
				escrowRows[index].fee = d.fee / 1e18 ?? 0;
			});
			setTotalVestable(
				Object.values(escrowRows)
					.map((d) => d.vestable)
					.reduce((acc, curr) => acc + curr, 0)
			);
		},
	});

	const resetTime = useMemo(() => {
		const { epochEnd } = getEpochDetails(network?.id, epochPeriod);
		return epochEnd;
	}, [epochPeriod, network?.id]);

	const kwentaTokenApproval = useMemo(() => kwentaBalance.gt(kwentaAllowance), [
		kwentaBalance,
		kwentaAllowance,
	]);

	const vKwentaTokenApproval = useMemo(() => vKwentaBalance.gt(vKwentaAllowance), [
		vKwentaBalance,
		vKwentaAllowance,
	]);

	const veKwentaTokenApproval = useMemo(() => veKwentaBalance.gt(veKwentaAllowance), [
		veKwentaBalance,
		veKwentaAllowance,
	]);

	const { config: getRewardConfig } = usePrepareContractWrite({
		...stakingRewardsContract,
		functionName: 'getReward',
		overrides: {
			gasLimit: STAKING_HIGH_GAS_LIMIT,
		},
		enabled: claimableBalance.gt(0),
	});

	const { config: kwentaApproveConfig } = usePrepareContractWrite({
		...kwentaTokenContract,
		functionName: 'approve',
		args: [stakingRewardsContract.address, ethers.constants.MaxUint256],
		enabled: !!walletAddress && kwentaTokenApproval,
	});

	const { config: vKwentaApproveConfig } = usePrepareContractWrite({
		...vKwentaTokenContract,
		functionName: 'approve',
		args: [vKwentaRedeemerContract.address, ethers.constants.MaxUint256],
		enabled: !!walletAddress && vKwentaTokenApproval,
	});

	const { config: veKwentaApproveConfig } = usePrepareContractWrite({
		...veKwentaTokenContract,
		functionName: 'approve',
		args: [veKwentaRedeemerContract.address, ethers.constants.MaxUint256],
		enabled: !!walletAddress && veKwentaTokenApproval,
	});

	const { config: vKwentaRedeemConfig } = usePrepareContractWrite({
		...vKwentaRedeemerContract,
		functionName: 'redeem',
		overrides: {
			gasLimit: STAKING_LOW_GAS_LIMIT,
		},
		enabled: !!walletAddress && wei(vKwentaBalance).gt(0),
	});

	const { config: veKwentaRedeemConfig } = usePrepareContractWrite({
		...veKwentaRedeemerContract,
		functionName: 'redeem',
		args: [walletAddress],
		overrides: {
			gasLimit: STAKING_HIGH_GAS_LIMIT,
		},
		enabled: !!walletAddress && wei(veKwentaBalance).gt(0),
	});

	return {
		weekCounter,
		totalStakedBalance: Number(totalStakedBalance),
		periods,
		resetTime,
		epochPeriod,
		escrowRows,
		escrowedBalance,
		totalVestable,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		kwentaBalance,
		vKwentaBalance,
		veKwentaBalance,
		vKwentaAllowance,
		veKwentaAllowance,
		kwentaAllowance,
		getRewardConfig,
		kwentaApproveConfig,
		vKwentaApproveConfig,
		veKwentaApproveConfig,
		vKwentaRedeemConfig,
		veKwentaRedeemConfig,
		kwentaTokenApproval,
		vKwentaTokenApproval,
		veKwentaTokenApproval,
		stakingRewardsContract,
		rewardEscrowContract,
		vKwentaRedeemerContract,
		veKwentaRedeemerContract,
		multipleMerkleDistributorContract,
	};
};

export default useStakingData;

import {
	getFuturesTradesBetweenPeriod,
	getSynthExchangesBetweenPeriod,
	mergeDatasets,
} from '@kwenta/trading-incentives';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { erc20ABI, useContractRead, useContractReads, usePrepareContractWrite } from 'wagmi';

import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import supplyScheduleABI from 'lib/abis/SupplySchedule.json';
import vKwentaRedeemerABI from 'lib/abis/vKwentaRedeemer.json';
import useGetSpotFeeForAccount from 'queries/staking/useGetSpotFeeForAccount';
import { EPOCH_START, getEpochDetails, WEEK } from 'queries/staking/utils';
import { formatShortDate, formatTruncatedDuration, toJSTimestamp } from 'utils/formatters/date';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

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

let data: EscrowRow[] = [];

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
	const [epochDate, setEpochDate] = useState(`16 Oct, 2022 - 23 Oct, 2022`);
	const { walletAddress, provider } = Connector.useContainer();
	const [kwentaBalance, setKwentaBalance] = useState(zeroBN);
	const [escrowedBalance, setEscrowedBalance] = useState(zeroBN);
	const [stakedNonEscrowedBalance, setStakedNonEscrowedBalance] = useState(zeroBN);
	const [stakedEscrowedBalance, setStakedEscrowedBalance] = useState(zeroBN);
	const [totalStakedBalance, setTotalStakedBalance] = useState(zeroBN);
	const [claimableBalance, setClaimableBalance] = useState(zeroBN);
	const [apy, setApy] = useState('0');
	const [vKwentaBalance, setVKwentaBalance] = useState(zeroBN);
	const [vKwentaAllowance, setVKwentaAllowance] = useState(zeroBN);
	const [kwentaAllowance, setKwentaAllowance] = useState(zeroBN);
	const [currentWeeklyReward, setCurrentWeeklyReward] = useState(zeroBN);
	const [feePaid, setFeesPaid] = useState(0);
	const [totalFeePaid, setTotalFeePaid] = useState(0);
	const [epochStart, setEpochStart] = useState(EPOCH_START);
	const [epochEnd, setEpochEnd] = useState(EPOCH_START + WEEK);
	const [tradingRewardsRatio, setTradingRewardsRatio] = useState(0);

	useContractReads({
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
				setStakedNonEscrowedBalance(wei(data[1] ?? zeroBN));
				setStakedEscrowedBalance(wei(data[2] ?? zeroBN));
				setClaimableBalance(wei(data[3] ?? zeroBN));
				setKwentaBalance(wei(data[4] ?? zeroBN));
				setTotalStakedBalance(wei(data[8] ?? zeroBN));
				const supplyRate = wei(1).sub(wei(data[5] ?? zeroBN));
				const initialWeeklySupply = wei(data[6] ?? zeroBN);
				const weekCounter = Number(data[7] ?? zeroBN);
				const startWeeklySupply = initialWeeklySupply.mul(supplyRate.pow(weekCounter));
				const yearlyRewards = totalStakedBalance.gt(zeroBN)
					? startWeeklySupply.mul(wei(1).sub(supplyRate.pow(52))).div(wei(1).sub(supplyRate))
					: zeroBN;
				setCurrentWeeklyReward(startWeeklySupply.mul(0.2));
				setApy(
					yearlyRewards.gt(zeroBN) ? Number(yearlyRewards.div(totalStakedBalance)).toFixed(2) : '0'
				);
				setVKwentaBalance(wei(data[9] ?? zeroBN));
				setVKwentaAllowance(wei(data[10] ?? zeroBN));
				setKwentaAllowance(wei(data[11] ?? zeroBN));
			}
		},
	});

	data = [];

	const { data: vestingSchedules } = useContractRead({
		...rewardEscrowContract,
		functionName: 'getVestingSchedules',
		args: [walletAddress ?? undefined, 0, 1000],
		watch: true,
		enabled: !!walletAddress,
		select: (data) => data.filter((d) => d.escrowAmount.gt(0)),
		onError(error) {
			if (error) logError(error);
		},
	});

	vestingSchedules &&
		vestingSchedules.length > 0 &&
		vestingSchedules.forEach((d: VestingEntry) => {
			data.push({
				id: Number(d.entryID),
				date: moment(Number(d.endTime) * 1000).format('MM/DD/YY'),
				time: formatTruncatedDuration(d.endTime - new Date().getTime() / 1000),
				vestable: d.endTime * 1000 > Date.now() ? 0 : Number(d.escrowAmount / 1e18),
				amount: Number(d.escrowAmount / 1e18),
				fee: d.endTime * 1000 > Date.now() ? Number(d.escrowAmount / 1e18) : 0,
				status: d.endTime * 1000 > Date.now() ? 'VESTING' : 'VESTED',
			});
		});

	const contracts = data.map((d) => {
		return {
			...rewardEscrowContract,
			functionName: 'getVestingEntryClaimable',
			args: [walletAddress ?? undefined, d.id],
		};
	});

	const {
		data: vestingEntryClaimable,
		isSuccess: vestingEntryClaimableIsSuccess,
	} = useContractReads({
		contracts,
		watch: true,
		enabled: !!walletAddress && contracts.length > 0,
	});

	vestingEntryClaimableIsSuccess &&
		vestingEntryClaimable !== undefined &&
		vestingEntryClaimable.forEach((d, index) => {
			data[index].vestable = Number(d.quantity / 1e18);
			data[index].fee = Number(d.fee / 1e18);
		});

	const totalVestable = data.reduce((acc, current, index) => acc + data[index]?.vestable ?? 0, 0);

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

	useEffect(() => {
		const snapshot = async () => {
			const { epochStart, epochEnd } = await getEpochDetails(provider, 1);
			setEpochStart(epochStart);
			setEpochEnd(epochEnd);
			const startDate = formatShortDate(new Date(toJSTimestamp(epochStart)));
			const endDate = formatShortDate(new Date(toJSTimestamp(epochEnd)));
			setEpochDate(`${startDate} - ${endDate}`);
		};
		snapshot();
	}, [provider]);

	const SpotFeeQuery = useGetSpotFeeForAccount(walletAddress!);
	const spotFeePaid = useMemo(() => {
		const t = SpotFeeQuery.data?.synthExchanges ?? [];

		return t
			.map((trade: any) => Number(trade.feesInUSD))
			.reduce((acc: number, curr: number) => acc + curr, 0);
	}, [SpotFeeQuery.data]);

	useEffect(() => {
		const snapshot = async () => {
			setFeesPaid(spotFeePaid ?? 0);
			const synthExchanges = await getSynthExchangesBetweenPeriod(epochStart, epochEnd);
			const futuresTrades = await getFuturesTradesBetweenPeriod(epochStart, epochEnd);
			const feePaidByTrader = await mergeDatasets(synthExchanges, futuresTrades);
			setTotalFeePaid(
				Object.values(feePaidByTrader).reduce((acc, current) => acc + Number(current), 0) ?? 0
			);
			const tradingRewardsScore =
				Math.pow(feePaid, 0.7) *
				Math.pow(Number(stakedNonEscrowedBalance) + Number(stakedEscrowedBalance), 0.3);
			const totalTradingRewardsScore =
				Math.pow(totalFeePaid / 1e18, 0.7) * Math.pow(Number(totalStakedBalance), 0.3);
			setTradingRewardsRatio(
				!_.isNil(totalTradingRewardsScore) ? tradingRewardsScore / totalTradingRewardsScore : 0
			);
		};
		snapshot();
	}, [
		currentWeeklyReward,
		epochEnd,
		epochStart,
		feePaid,
		provider,
		spotFeePaid,
		stakedEscrowedBalance,
		stakedNonEscrowedBalance,
		totalFeePaid,
		totalStakedBalance,
	]);

	return {
		epochPeriod,
		epochDate,
		epochStart,
		epochEnd,
		data,
		feePaid,
		totalFeePaid,
		tradingRewardsRatio,
		escrowedBalance,
		totalVestable,
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

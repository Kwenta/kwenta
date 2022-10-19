import { wei } from '@synthetixio/wei';
import { useState } from 'react';
import { erc20ABI, useContractReads } from 'wagmi';

import Connector from 'containers/Connector';
import rewardEscrowABI from 'lib/abis/RewardEscrow.json';
import stakingRewardsABI from 'lib/abis/StakingRewards.json';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

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

const useStakingData = () => {
	const { walletAddress } = Connector.useContainer();
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

	return {
		escrowedBalance,
		vestedBalance,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		kwentaBalance,
	};
};

export default useStakingData;

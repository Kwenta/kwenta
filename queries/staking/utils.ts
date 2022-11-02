import { BlockTag, StakedBalance } from '@kwenta/trading-incentives';
import { Provider } from '@wagmi/core';
import { Contract, Provider as EthcallProvider } from 'ethcall';
import EthDater from 'ethereum-block-by-date';
import { BigNumber } from 'ethers';

import stakingRewardsABI from 'lib/abis/StakingRewards.json';

export const EPOCH_START = 1665878400;
export const WEEK = 604800;

const stakingRewardsContract = {
	addressOrName: '0x1653a3a3c4ccee0538685f1600a30df5e3ee830a',
	contractInterface: stakingRewardsABI,
};

export async function getEpochDetails(provider: Provider, epoch: number) {
	const currentEpochTime = EPOCH_START + WEEK * epoch;
	const epochEndTime = currentEpochTime + WEEK;
	const firstBlockInEpoch = await getBlockForTimestamp(provider, epochEndTime);
	const lastBlockInEpoch = await getBlockForTimestamp(provider, epochEndTime, false);
	return {
		epochStart: currentEpochTime,
		epochEnd: epochEndTime,
		epochStartBlock: firstBlockInEpoch,
		epochEndBlock: lastBlockInEpoch,
	};
}

export async function getBlockForTimestamp(
	provider: Provider,
	timestamp: number,
	blockAfter: boolean = true
) {
	const dater = new EthDater(
		provider // Ethers provider, required.
	);
	const block = await dater.getDate(
		timestamp * 1000, // Date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
		blockAfter, // Block after, optional. Search for the nearest block before or after the given date. By default true.
		false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
	);

	return block.block;
}

export async function getStakedBalances(
	provider: Provider,
	addresses: string[],
	blockTag: BlockTag = 'latest'
): Promise<StakedBalance[]> {
	const ethcallProvider = new EthcallProvider();
	await ethcallProvider.init(provider);
	const stakingRewards = new Contract(
		stakingRewardsContract.addressOrName,
		stakingRewardsContract.contractInterface
	);
	const balanceOfCalls = addresses.map((a) => stakingRewards.balanceOf(a));
	const data = (await ethcallProvider.all(balanceOfCalls, blockTag)) as BigNumber[];

	return addresses.map((a, i) => ({
		address: a,
		balance: data[i],
	}));
}

import { Provider } from '@wagmi/core';
import EthDater from 'ethereum-block-by-date';

export const EPOCH_START = 1665878400;
export const WEEK = 604800;

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

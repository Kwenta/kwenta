export const EPOCH_START: Record<number, number> = {
	420: 1665878400,
	10: 1668556800,
};

export const WEEK = 604800;

export function getEpochDetails(networkId: number, epoch: number) {
	const currentEpochTime = EPOCH_START[networkId]
		? EPOCH_START[networkId] + WEEK * epoch
		: EPOCH_START[10];
	const epochEndTime = currentEpochTime + WEEK;
	return {
		epochStart: currentEpochTime,
		epochEnd: epochEndTime,
	};
}

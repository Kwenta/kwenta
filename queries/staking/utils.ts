export const EPOCH_START = 1665878400;
export const WEEK = 604800;

export function getEpochDetails(epoch: number) {
	const currentEpochTime = EPOCH_START + WEEK * epoch;
	const epochEndTime = currentEpochTime + WEEK;
	return {
		epochStart: currentEpochTime,
		epochEnd: epochEndTime,
	};
}

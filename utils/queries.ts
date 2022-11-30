// Takes a comparitor which should return a bool condition to
// signal to continue retrying, comparing prev and new query result

import logError from './logError';

export const refetchWithComparator = async (
	query: () => Promise<any>,
	existingResult: any,
	comparator: (previous: any, current: any) => boolean,
	interval = 1000,
	max = 25
) => {
	return new Promise((res) => {
		let count = 1;

		const refetch = async (existingResult: any) => {
			const timeout = setTimeout(async () => {
				if (count > max) {
					clearTimeout(timeout);
					logError('refetch timeout');
					res({ data: null, status: 'timeout' });
				} else {
					const next = await query();
					count += 1;
					if (!comparator(existingResult, next)) {
						clearTimeout(timeout);
						res({ data: next, status: 'complete' });
					} else {
						refetch(next);
					}
				}
			}, interval);
		};
		refetch(existingResult);
	});
};

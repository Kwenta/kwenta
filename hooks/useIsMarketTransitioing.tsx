import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

const SECONDS_PER_HALF_DAY = 12 * 60 * 60;

const useIsMarketTransitioning = (nextOpen: Date | null) => {
	const [now, setNow] = useState(new Date());
	useEffect(() => {
		const timerID = setInterval(() => setNow(new Date()), 1000);
		return function cleanup() {
			clearInterval(timerID);
		};
	}, []);

	if (nextOpen == null) return false;
	return differenceInSeconds(nextOpen, now) <= SECONDS_PER_HALF_DAY;
};

export default useIsMarketTransitioning;

import { useEffect, useState } from 'react';
import { differenceInMilliseconds } from 'date-fns';

const getHHMMSS = (milliseconds: number) => new Date(milliseconds).toISOString().substr(11, 8);

const useMarketHoursTimer = (nextOpen: Date | null) => {
	const [now, setNow] = useState(new Date());
	useEffect(() => {
		const timerID = setInterval(() => setNow(new Date()), 1000);
		return function cleanup() {
			clearInterval(timerID);
		};
	}, []);

	if (nextOpen == null) return getHHMMSS(0);
	return getHHMMSS(differenceInMilliseconds(nextOpen, now));
};

export default useMarketHoursTimer;

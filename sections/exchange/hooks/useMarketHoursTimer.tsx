import { differenceInSeconds } from 'date-fns';
import { useEffect, useState } from 'react';

function secondsToHHMMSS(seconds: number) {
	return (
		Math.floor(seconds / 3600) +
		':' +
		('0' + (Math.floor(seconds / 60) % 60)).slice(-2) +
		':' +
		('0' + (seconds % 60)).slice(-2)
	);
}

const useMarketHoursTimer = (nextOpen: Date | null) => {
	const [now, setNow] = useState(new Date());
	useEffect(() => {
		const timerID = setInterval(() => setNow(new Date()), 1000);
		return function cleanup() {
			clearInterval(timerID);
		};
	}, []);

	if (nextOpen == null) return secondsToHHMMSS(0);
	return secondsToHHMMSS(differenceInSeconds(nextOpen, now));
};

export default useMarketHoursTimer;

import { differenceInSeconds } from 'date-fns';
import React from 'react';

const secondsToDDHHMM = (seconds: number) => {
	return (
		Math.floor(seconds / (3600 * 24)) +
		'd:' +
		('0' + (Math.floor(seconds / 3600) % 24)).slice(-2) +
		'h:' +
		('0' + (Math.floor(seconds / 60) % 60)).slice(-2) +
		'm'
	);
};

const useRewardsTimer = (deadline: Date | null) => {
	const [now, setNow] = React.useState(new Date());

	React.useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	if (!deadline || deadline < new Date()) return secondsToDDHHMM(0);
	return secondsToDDHHMM(differenceInSeconds(deadline, now));
};

export default useRewardsTimer;
